import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { trigger, transition, useAnimation } from '@angular/animations';
import {
  slideInRight,
  slideOutRight,
} from '../../../services/site-animations.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  animations: [
    trigger('slideInFromRight', [
      transition(':enter', [useAnimation(slideInRight)]),
      transition(':leave', [useAnimation(slideOutRight)]),
    ]),
  ],
})
export class ResetPasswordComponent implements OnInit {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  form = this.fb.nonNullable.group({
    password1: ['', Validators.required],
    password2: ['', Validators.required],
  });

  showConfirmation = signal(false);

  errorMessage: string | null = null;
  actionCode = signal('');

  get password1(): AbstractControl | null {
    return this.form.get('password1');
  }
  get password2(): AbstractControl | null {
    return this.form.get('password2');
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const code = params['oobCode'];
      if (code) {
        this.actionCode.set(code);
      }
    });
  }

  comparePasswords() {
    return (
      this.form.controls.password1.value !== '' &&
      this.form.controls.password2.value !== '' &&
      this.form.controls.password1.value === this.form.controls.password2.value
    );
  }

  onSubmit() {
    if (this.comparePasswords()) {
      const newPassword = this.form.controls.password1.value;
      this.authService.handleResetPassword(this.actionCode(), newPassword);
      this.showConfirmation.set(true);
      setTimeout(() => {
        this.showConfirmation.set(false);
        this.router.navigateByUrl('/login');
      }, 1000);
    }
  }
}
