import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { trigger, transition, useAnimation } from '@angular/animations';
import {
  slideInRight,
  slideOutRight,
} from '../../../services/site-animations.service';
import { UserProfile } from '../../../interfaces/user-profile.interface';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  animations: [
    trigger('slideInFromRight', [
      transition(':enter', [useAnimation(slideInRight)]),
      transition(':leave', [useAnimation(slideOutRight)]),
    ]),
  ],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  errorMessage: string | null = null;

  checkBoxUnchecked = 'img/checkbox-unchecked.svg';
  checkBoxChecked = 'img/checkbox-checked.svg';
  privacyPolicyChecked = signal(false);
  privacyPolicyUnchecked = signal(true);
  currentCheckBox = computed(() => {
    return this.privacyPolicyChecked()
      ? this.checkBoxChecked
      : this.checkBoxUnchecked;
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

  showConfirmation = signal(false);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/
        ),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  username = this.form.get('username');
  email = this.form.get('email');
  password = this.form.get('password');

  newUser!: Partial<UserProfile>;
  newUserPassword = '';

  setNewUser() {
    const rawForm = this.form.getRawValue();
    if (this.privacyPolicyChecked() && this.form.valid) {
      const userWithoutUid: Omit<UserProfile, 'uid'> = {
        displayName: rawForm.username,
        email: rawForm.email,
        avatarUrl: this.avatarUrl(),
        heartbeat: serverTimestamp(),
      };
      this.newUserPassword = rawForm.password;

      this.newUser = {
        ...userWithoutUid,
        uid: '',
      };

      this.chooseAvatar.set(true);
    }
  }

  onSubmit(): void {
    if (this.privacyPolicyChecked()) {
      const { email, displayName } = this.newUser;

      if (!email || !displayName) {
        this.errorMessage = 'Fehlende Benutzerdaten';
        return;
      }

      this.authService
        .register(email, displayName, this.newUserPassword)
        .subscribe({
          next: async () => {
            const currentUser = this.authService.currentUser();
            if (currentUser?.uid) {
              const completedUser: UserProfile = {
                uid: currentUser.uid,
                displayName,
                email,
                avatarUrl: this.newUser.avatarUrl ?? '',
                heartbeat: this.newUser.heartbeat ?? serverTimestamp(),
              };

              await this.userService.addUser(completedUser);
              await this.updateAvatarUrl();
            }
          },
          error: (err) => {
            const mappedError = this.mapFirebaseError(err?.code);
            this.errorMessage = mappedError;
            console.error(err);
          },
        });
    }
  }

  async updateAvatarUrl() {
    const currentUser = this.authService.currentUser();
    if (currentUser?.uid) {
      const userId = currentUser.uid;
      try {
        await this.userService.updateUserFields(userId, {
          avatarUrl: this.avatarUrl(),
        });
      } catch (error) {
        console.error(error);
      } finally {
        this.handleConfiramtionOverlay();
      }
    }
  }

  toggleCheckbox(): void {
    this.privacyPolicyChecked.update((value) => !value);
    this.privacyPolicyUnchecked.set(false);
  }

  setAvatarUrl(index: number) {
    this.avatarUrl.set(this.avatarUrls[index]);
  }

  private handleConfiramtionOverlay() {
    this.showConfirmation.set(true);
    setTimeout(() => {
      this.showConfirmation.set(false);
      this.router.navigateByUrl('/');
    }, 1000);
  }

  private mapFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Email existiert bereits.';
      default:
        return 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    }
  }
}
