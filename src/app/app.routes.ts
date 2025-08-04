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
import { ChannelMessageComponent } from './components/main/channel-message/channel-message.component';
import { NewMessageComponent } from './components/main/new-message/new-message.component';
import { DirectMessageComponent } from './components/main/direct-message/direct-message.component';
import { ImprintComponent } from './components/main/imprint/imprint.component';

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
        path: 'channel/:channel',
        component: ChannelMessageComponent,
      },
      {
        path: 'user/:userId',
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
  {
    path: 'imprint',
    component: ImprintComponent,
  },
];
