import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  @Output() closeDialog = new EventEmitter<void>();
  private userService = inject(UserService);
  private authService = inject(AuthService);

  isEditMode = signal(false);

  getCurrentUserInUserCollection() {
    return this.userService.users.find(
      (user) => user.uid === this.authService.currentUser()?.uid
    );
  }

  toggleEditMode() {
    this.isEditMode.update((value) => !value);
  }

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
