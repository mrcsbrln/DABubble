import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';
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
  userService = inject(UserService);
  fb = inject(FormBuilder);
  router = inject(Router);

  errorMessage: string | null = null;

  checkBoxUnchecked = 'img/checkbox-unchecked.svg';
  checkBoxChecked = 'img/checkbox-checked.svg';
  isChecked = signal(false);
  currentCheckBox = computed(() => {
    return this.isChecked() ? this.checkBoxChecked : this.checkBoxUnchecked;
  });

  chooseAvatar = signal(true);
  avatarUrl = signal('img/avatar/avatar-default.svg');

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  username = this.form.get('username');
  email = this.form.get('email');
  password = this.form.get('password');

  navigateToApp() {
    this.router.navigateByUrl('/');
  }

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    if (this.isChecked()) {
      this.authService
        .register(rawForm.email, rawForm.username, rawForm.password)
        .subscribe({
          error: (err) => {
            this.errorMessage = err.code;
          },
        });
      this.chooseAvatar.set(true);
    }
  }

  toggleCheckbox(): void {
    this.isChecked.update((value) => !value);
  }
}
