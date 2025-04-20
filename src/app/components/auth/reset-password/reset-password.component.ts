import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  password = this.form.get('password');

  errorMessage: string | null = null;

  onSubmit() {}
}
