import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
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
    password: ['', Validators.required],
  });

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    this.authService
      .register(rawForm.email, rawForm.username, rawForm.password)
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
