import { Injectable, inject, OnDestroy } from '@angular/core';
import { UserProfile } from '../interface/user-profile.interface';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  Unsubscribe,
  docData,
} from '@angular/fire/firestore';
import { AuthService } from './auth/auth.service';
import { Observable, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  users: UserProfile[] = [];
  firestore: Firestore = inject(Firestore);
  authService = inject(AuthService);
  private currentUserData$ = this.authService.currentUser$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(null);
      }
      return docData(
        this.userDocRef('users', user?.uid)
      ) as Observable<UserProfile>;
    })
  );

  currentUserData = toSignal(this.currentUserData$);

  unsubUsersCollection!: Unsubscribe;
  // unsubUserDocument;

  constructor() {
    this.unsubUsersCollection = this.subUserCollection();
    // this.unsubUserDocument = onSnapshot(
    //   this.userDocRef('users', ''),
    //   (user) => {
    //     console.log(user);
    //   }
    // );
  }

  ngOnDestroy() {
    this.unsubUsersCollection();
    // this.unsubUserDocument();
  }

  usersCollectionRef() {
    return collection(this.firestore, 'users');
  }

  userDocRef(colId: string, docId: string) {
    return doc(this.firestore, colId, docId);
  }

  subUserCollection() {
    return onSnapshot(this.usersCollectionRef(), (users) => {
      this.users = [];
      users.forEach((user) => {
        this.users.push(this.setUserObject(user.data(), user.id));
      });
    });
  }

  setUserObject(obj: any, id: string): UserProfile {
    return {
      uid: id,
      displayName: obj.displayName || '',
      email: obj.email || '',
      avatarUrl: obj.avatarUrl || '',
      status: obj.status || 'offline',
    };
  }

  addUser(user: UserProfile): Promise<void> {
    const ref = doc(this.firestore, 'users', user.uid);
    return setDoc(ref, user);
  }
}
