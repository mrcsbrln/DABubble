import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { MainComponent } from './components/main/main.component';

export const routes: Routes = [
  { path: '', component: MainComponent},
  // { path: '', component: MainComponent, canActivate: [authGuard] }, //TODO Temporär auskommentiert, POST 400
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
];
