import {
  Injectable,
  inject,
  EnvironmentInjector,
  runInInjectionContext,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { UserProfile } from '../interfaces/user-profile.interface';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  Unsubscribe,
  docData,
  updateDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from '@angular/fire/firestore';
import { AuthService } from './auth/auth.service';
import { Observable, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  users = signal<UserProfile[]>([]);
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(EnvironmentInjector);
  private destroyRef = inject(DestroyRef);
  heartbeatTimer!: ReturnType<typeof setInterval>;

  onlineUsersIds = computed(() =>
    this.users()
      .filter((user) => this.isOnline(user.heartbeat))
      .map((user) => user.uid)
  );

  private currentUserData$ = this.authService.currentUser$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(null);
      }
      return runInInjectionContext(
        this.injector,
        () =>
          docData(this.userDocRef('users', user.uid)) as Observable<UserProfile>
      );
    })
  );

  currentUserData = toSignal(this.currentUserData$);

  unsubUsersCollection!: Unsubscribe;

  constructor() {
    this.unsubUsersCollection = this.subUserCollection();
    this.heartbeatTimer = setInterval(
      () => this.sendHeartbeat(),
      5 * 60 * 1000
    );

    this.destroyRef.onDestroy(() => {
      clearInterval(this.heartbeatTimer);
    });
  }

  private usersCollectionRef() {
    return collection(this.firestore, 'users');
  }

  private userDocRef(colId: string, docId: string) {
    return doc(this.firestore, colId, docId);
  }

  private subUserCollection() {
    return onSnapshot(this.usersCollectionRef(), (snapshot) => {
      const updatedUsers = snapshot.docs.map((doc) =>
        this.setUserObject(doc.data(), doc.id)
      );
      this.users.set(updatedUsers);
    });
  }

  private setUserObject(obj: Partial<UserProfile>, id: string): UserProfile {
    return {
      uid: id,
      displayName: obj.displayName || '',
      email: obj.email || '',
      avatarUrl: obj.avatarUrl || '',
      heartbeat: obj.heartbeat ?? null,
    };
  }

  addUser(user: UserProfile): Promise<void> {
    const ref = doc(this.firestore, 'users', user.uid);
    return setDoc(ref, user);
  }

  getUserById(id: string) {
    return this.users().find((user) => user.uid === id);
  }

  private sendHeartbeat() {
    const currentUserId = this.authService.currentUser()?.uid;
    const data = { heartbeat: serverTimestamp() };
    if (currentUserId && data) {
      this.updateUserFields(currentUserId, data);
    }
  }

  private isOnline(heartbeat: Timestamp | FieldValue | null) {
    if (heartbeat instanceof Timestamp) {
      return Date.now() - heartbeat.toDate().getTime() <= 2 * 60 * 1000;
    }
    return false;
  }

  updateUserFields(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = this.userDocRef('users', userId);
    return updateDoc(userRef, data);
  }
}
