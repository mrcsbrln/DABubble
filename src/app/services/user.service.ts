import { Injectable, inject, OnDestroy } from '@angular/core';
import { User } from '../interface/user.interface';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  Unsubscribe,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  users: User[] = [];
  firestore: Firestore = inject(Firestore);

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
    return doc(collection(this.firestore, colId, docId));
  }

  subUserCollection() {
    return onSnapshot(this.usersCollectionRef(), (users) => {
      this.users = [];
      users.forEach((user) => {
        this.users.push(this.setUserObject(user.data(), user.id));
      });
    });
  }

  setUserObject(obj: any, id: string): User {
    return {
      id: id,
      username: obj.username || '',
      email: obj.email || '',
      avatarUrl: obj.avatarUrl || '',
      status: obj.status || 'offline',
    };
  }
}
