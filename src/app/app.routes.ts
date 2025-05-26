import { Routes } from '@angular/router';
import {
  canActivate,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { MainComponent } from './components/main/main.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { ChatComponent } from './components/main/chat/chat.component';
import { NewMessageComponent } from './components/main/new-message/new-message.component';
import { DirectMessageComponent } from './components/main/direct-message/direct-message.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['']);

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    ...canActivate(redirectUnauthorizedToLogin),
    children: [
      { path: '', component: NewMessageComponent },
      {
        path: 'channels/:channel',
        component: ChatComponent,
      },
      {
        path: 'user/:username/:userId',
        component: DirectMessageComponent,
      },
    ],
  },
  {
    path: 'register',
    component: RegisterComponent,
    ...canActivate(redirectLoggedInToHome),
  },

  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(redirectLoggedInToHome),
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
];
