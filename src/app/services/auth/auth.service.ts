import { inject, Injectable, signal, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  authState,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { User as AppUser } from '../../interface/user.interface'; // Pfad anpassen
import { doc, setDoc, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  router = inject(Router);

  private authState$: Observable<FirebaseUser | null> = authState(
    this.firebaseAuth
  );

  readonly currentUser: Signal<FirebaseUser | null | undefined> = toSignal(
    this.authState$
  );

  readonly isLoggedIn: Signal<boolean> = computed(() => !!this.currentUser());

  register(
    email: string,
    username: string,
    password: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(async (response) => {
      const uid = response.user.uid;
      await updateProfile(response.user, { displayName: username });
      const userData: AppUser = {
        username,
        email,
        avatarUrl: '',
        status: 'online',
      };
      return await setDoc(doc(this.firestore, 'users', uid), userData);
    });
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {});
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth)
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Fehler beim Logout oder Navigieren:', error);
        throw error;
      });
    return from(promise);
  }
}
