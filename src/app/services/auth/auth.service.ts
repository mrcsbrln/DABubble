import { inject, Injectable, signal, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  authState,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { UserProfile } from '../../interface/user-profile.interface';
import { doc, setDoc, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  router = inject(Router);
  goggleAuthProvider = new GoogleAuthProvider();

  private authState$: Observable<User | null> = authState(this.firebaseAuth);

  currentUser$ = authState(this.firebaseAuth);

  readonly currentUser: Signal<User | null | undefined> = toSignal(
    this.authState$
  );

  readonly isLoggedIn: Signal<boolean> = computed(() => !!this.currentUser());

  register(
    email: string,
    displayName: string,
    password: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(async (response) => {
      const uid = response.user.uid;
      await updateProfile(response.user, { displayName: displayName });
      const userData: UserProfile = {
        uid,
        displayName,
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

  async googleLogin(): Promise<UserProfile | null> {
    const userCredential = await signInWithPopup(
      this.firebaseAuth,
      this.goggleAuthProvider
    );
    const additionalInfo = getAdditionalUserInfo(userCredential);
    if (!additionalInfo?.isNewUser) {
      return Promise.resolve(null);
    }
    const {
      user: { displayName, uid, email },
    } = userCredential;

    const newProfile = {
      displayName: displayName ?? '',
      uid,
      email: email ?? '',
    };
    return Promise.resolve(newProfile);
  }
}
