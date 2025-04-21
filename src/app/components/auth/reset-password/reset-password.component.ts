import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    password1: ['', Validators.required],
    password2: ['', Validators.required],
  });

  showConfirmation = signal(false);

  errorMessage: string | null = null;

  get password1(): AbstractControl | null {
    return this.form.get('password1');
  }
  get password2(): AbstractControl | null {
    return this.form.get('password2');
  }

  comparePasswords() {
    return (
      this.form.controls.password1.value === this.form.controls.password2.value
    );
  }

  onSubmit() {
    const currentUser = this.authService.currentUser();
    const newPassword = this.form.controls.password1.value;
    if (currentUser && this.comparePasswords()) {
      this.authService.updateUserPassword(currentUser, newPassword);
      this.showConfirmation.set(true);
      setTimeout(() => {
        this.showConfirmation.set(false);
        this.router.navigateByUrl('/login');
      }, 1000);
    }
  }
}
