import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { doc, setDoc, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router'; // Router importieren

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  router = inject(Router);
  user$ = user(this.firebaseAuth);
  currentUser$ = signal<User | null | undefined>(undefined);

  register(
    email: string,
    username: string,
    password: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((response) => {
      const uid = response.user.uid;
      return updateProfile(response.user, { displayName: username }).then(
        () => {
          const userData: User = {
            username,
            email,
            avatarUrl: '',
            status: 'offline',
          };
          return setDoc(doc(this.firestore, 'users', uid), userData);
        }
      );
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
        // Navigation direkt nach dem Firebase SignOut
        this.currentUser$.set(null); // Signal explizit auf null setzen
        this.router.navigate(['/login']);
        console.log('Logout erfolgreich, Navigation im Service ausgelöst.');
      })
      .catch((error) => {
        console.error('Fehler beim Logout oder Navigieren:', error);
        // Fehlerbehandlung, vielleicht willst du trotzdem navigieren?
        // this.router.navigate(['/login']);
      });
    return from(promise);
  }
}
