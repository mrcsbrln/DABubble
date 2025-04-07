import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  authService = inject(AuthService);
  formBuilder = inject(FormBuilder);
  router = inject(Router);

  errorMessage: string | null = null;

  form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    passwort: ['', Validators.required],
  });

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    this.authService
      .register(rawForm.email, rawForm.passwort, rawForm.username)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.errorMessage = err.code;
        },
      });
  }
}
