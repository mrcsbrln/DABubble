import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "dabubble403", appId: "1:737440413813:web:5f70fada3aa89cee1c203c", storageBucket: "dabubble403.firebasestorage.app", apiKey: "AIzaSyBAHM6tfKP6DH0U5UvZu-zwJcrRGiHW7HE", authDomain: "dabubble403.firebaseapp.com", messagingSenderId: "737440413813" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
