import { Injectable, inject } from '@angular/core';
import { User } from '../models/user.model';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  users: User[] = [];
  firestore: Firestore = inject(Firestore);

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  async addUser(user: User) {
    try {
      await addDoc(this.getUsersRef(), user);
    } catch (err) {
      console.error(err);
    }
  }
}
