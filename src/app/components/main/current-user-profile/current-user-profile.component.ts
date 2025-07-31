import { Component, inject, output, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-current-user-profile',
  imports: [FormsModule],
  templateUrl: './current-user-profile.component.html',
  styleUrl: './current-user-profile.component.scss',
})
export class CurrentUserProfileComponent {
  closeDialog = output<void>();
  private userService = inject(UserService);
  private authService = inject(AuthService);

  isEditMode = signal(false);
  isHovering = signal(false);

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  newDisplayedName = signal('');

  getCurrentUserInUserCollection() {
    return this.userService
      .users()
      .find((user) => user.uid === this.authService.currentUser()?.uid);
  }

  async updateDisplayedName() {
    const currentUser = this.authService.currentUser();
    if (currentUser?.uid) {
      const userId = currentUser.uid;
      try {
        await this.userService.updateUserFields(userId, {
          displayName: this.newDisplayedName(),
        });
      } catch (error) {
        console.error(error);
      } finally {
        this.onCloseDialog();
      }
    }
  }

  isCurrentUserGuest() {
    return (
      this.authService.currentUser()?.uid === 'RlmORw3hSme1k6WjmBnVMQ8SCbI3'
    );
  }

  toggleEditMode() {
    this.isEditMode.update((value) => !value);
  }

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
