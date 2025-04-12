import { Injectable, inject, OnDestroy, OnInit } from '@angular/core';
import { User } from '../interface/user.interface';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  Unsubscribe,
} from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnInit, OnDestroy {
  users: User[] = [];
  firestore: Firestore = inject(Firestore);

  unsubUsersCollection!: Unsubscribe;
  // unsubUserDocument;

  ngOnInit() {
    this.unsubUsersCollection = this.subUserCollection();
    console.log(this.users);

    // this.unsubUserDocument = onSnapshot(
    //   this.getUserRef('users', ''),
    //   (user) => {
    //     console.log(user);
    //   }
    // );
  }

  ngOnDestroy() {
    this.unsubUsersCollection();
    // this.unsubUserDocument();
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getUserRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId, docId));
  }

  subUserCollection() {
    return onSnapshot(this.getUsersRef(), (users) => {
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
