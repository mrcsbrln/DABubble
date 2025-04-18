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

  chooseAvatar = signal(false);
  avatarUrl = signal('img/avatar/avatar-default.svg');
  avatarUrls: string[] = [
    'img/avatar/avatar1.svg',
    'img/avatar/avatar2.svg',
    'img/avatar/avatar3.svg',
    'img/avatar/avatar4.svg',
    'img/avatar/avatar5.svg',
    'img/avatar/avatar6.svg',
  ];

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  username = this.form.get('username');
  email = this.form.get('email');
  password = this.form.get('password');

  async finishRegistration() {
    const currentUser = this.authService.currentUser();
    if (currentUser?.uid) {
      const userId = currentUser.uid;
      try {
        await this.userService.updateUserFields(userId, {
          avatarUrl: this.avatarUrl(),
        });
      } catch (error) {
        console.error(error);
      }
      this.router.navigateByUrl('/');
    }
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

  setAvatarUrl(index: number) {
    this.avatarUrl.set(this.avatarUrls[index]);
  }
}
