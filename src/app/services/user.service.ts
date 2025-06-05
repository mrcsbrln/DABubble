import {
  Injectable,
  inject,
  OnDestroy,
  EnvironmentInjector,
  runInInjectionContext,
  signal,
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
} from '@angular/fire/firestore';
import { AuthService } from './auth/auth.service';
import { Observable, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  users = signal<UserProfile[]>([]);
  onlineUsersIds = signal<string[]>([]);
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private injector = inject(EnvironmentInjector);
  heartbeatTimer!: ReturnType<typeof setInterval>;
  getOnlineUsersTimer!: ReturnType<typeof setInterval>;
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
    this.sendHeartbeat();
    this.getOnlineUsersIds();
    this.heartbeatTimer = setInterval(
      () => this.sendHeartbeat(),
      2 * 60 * 1000
    );
    this.getOnlineUsersTimer = setInterval(
      () => this.getOnlineUsersIds(),
      2 * 60 * 1000
    );
  }

  ngOnDestroy() {
    this.unsubUsersCollection();
    clearInterval(this.heartbeatTimer);
    clearInterval(this.getOnlineUsersTimer);
  }

  usersCollectionRef() {
    return collection(this.firestore, 'users');
  }

  userDocRef(colId: string, docId: string) {
    return doc(this.firestore, colId, docId);
  }

  subUserCollection() {
    return onSnapshot(this.usersCollectionRef(), (snapshot) => {
      const updatedUsers = snapshot.docs.map((doc) =>
        this.setUserObject(doc.data(), doc.id)
      );
      this.users.set(updatedUsers);
    });
  }

  setUserObject(obj: Partial<UserProfile>, id: string): UserProfile {
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

  sendHeartbeat() {
    const currentUserId = this.authService.currentUser()?.uid;
    const data = { heartbeat: serverTimestamp() };
    if (currentUserId && data) {
      this.updateUserFields(currentUserId, data);
    }
  }

  checkIfUserIsOnline(id: string) {
    const user = this.getUserById(id);
    const heartbeat = user?.heartbeat;
    if (heartbeat instanceof Timestamp) {
      const heartbeatDate = heartbeat.toDate();
      const now = new Date();
      const delta = now.getTime() - heartbeatDate.getTime();
      return delta <= 2 * 1000 * 60;
    }
    return false;
  }

  getOnlineUsersIds() {
    const onlineIds = this.users()
      .filter((user) => this.checkIfUserIsOnline(user.uid))
      .map((user) => user.uid);
    this.onlineUsersIds.set(onlineIds);
    return onlineIds;
  }

  updateUserFields(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = this.userDocRef('users', userId);
    return updateDoc(userRef, data);
  }
}
