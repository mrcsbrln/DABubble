import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';
import { RouterLink } from '@angular/router';
import { transition, trigger, useAnimation, state } from '@angular/animations';
import {
  slideInRight,
  slideOutRight,
} from '../../../services/site-animations.service';
import { style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('slideInFromRight', [
      transition(':enter', [useAnimation(slideInRight)]),
      transition(':leave', [useAnimation(slideOutRight)]),
    ]),
    trigger('logoImgSlide', [
      transition(':enter', [
        style({ transform: 'translateX(117px)' }),
        animate(
          '600ms cubic-bezier(.35,0,.25,1)',
          style({ transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('revealText', [
      transition(':enter', [
        style({ transform: 'translateX(-152px)' }),
        animate(
          '800ms cubic-bezier(.35,0,.25,1)',
          style({ transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('logoContainerMove', [
      state(
        'center',
        style({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
        })
      ),
      state(
        'original',
        style({
          position: 'absolute',
          top: '75px',
          left: '75px',
          transform: 'translate(0, 0)',
        })
      ),
      transition('center => original', [
        animate('800ms cubic-bezier(.35,0,.25,1)'),
      ]),
    ]),
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  email = this.form.get('email');
  password = this.form.get('password');

  resetPassword = signal(false);
  showConfirmation = signal(false);
  showAnimatedText = signal(false);
  logoPosition = signal<'center' | 'original'>('center');

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rawForm = this.form.getRawValue();
    this.authService.login(rawForm.email, rawForm.password).subscribe({
      error: (err) => {
        const mappedError = this.mapFirebaseError(err?.code);
        this.errorMessage = mappedError;
      },
    });
  }

  private mapFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Ungültiges E-Mail-Format.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-Mail oder Passwort ist falsch.';
      default:
        return 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    }
  }

  async googleLogin() {
    try {
      const newUser = await this.authService.googleLogin();
      if (newUser) {
        this.userService.addUser(newUser);
      }
      this.router.navigate(['']);
    } catch (err) {
      console.error(err);
    }
  }

  async onResetPasswordSubmit() {
    if (this.email?.valid && this.form.controls.email.value) {
      const isGoogle = await this.authService.isGoogleProvider(
        this.form.controls.email.value
      );
      this.errorMessage = null;
      if (!isGoogle) {
        this.authService
          .resetPassword(this.form.controls.email.value)
          .subscribe({
            next: () => {
              this.errorMessage =
                'E-Mail zum Zurücksetzen des Passworts wurde gesendet.';
            },
            error: (err) => {
              console.error('Error sending password reset email:', err);
              this.errorMessage =
                'Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut.';
            },
          });
      }
      this.handleConfiramtionOverlay();
      this.email?.reset();
    } else {
      this.email?.markAsTouched();
      this.errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }
  }

  loginGuest() {
    this.authService.login('guest@dabubble403.de', 'dabubble403');
  }

  private handleConfiramtionOverlay() {
    this.showConfirmation.set(true);
    setTimeout(() => {
      this.showConfirmation.set(false);
      this.resetPassword.set(false);
    }, 1000);
  }

  onTextAnimationComplete() {
    this.logoPosition.set('original');
  }
}
