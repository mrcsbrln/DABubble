import { Component, computed, inject, signal } from '@angular/core';
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
  fb = inject(FormBuilder);
  router = inject(Router);

  errorMessage: string | null = null;

  checkBoxUnchecked = 'img/checkbox-unchecked.svg';
  checkBoxChecked = 'img/checkbox-checked.svg';
  isChecked = signal(false);
  currentCheckBox = computed(() => {
    return this.isChecked() ? this.checkBoxChecked : this.checkBoxUnchecked;
  });

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  username = this.form.get('username');
  email = this.form.get('email');
  password = this.form.get('password');

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

  toggleCheckbox(): void {
    this.isChecked.update((value) => !value);
  }
}
