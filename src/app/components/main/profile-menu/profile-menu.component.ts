import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CurrentUserProfileComponent } from '../current-user-profile/current-user-profile.component';

@Component({
  selector: 'app-profile-menu',
  imports: [CurrentUserProfileComponent],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  arrowDownOpen = signal(false);
  userProfileDialogOpen = signal(false);

  getCurrentUser() {
    return this.userService
      .users()
      .find((user) => user.uid === this.authService.currentUser()?.uid);
  }

  onLogout() {
    this.authService.logout();
  }

  onOpenDialog() {
    this.userProfileDialogOpen.set(true);
  }

  onCloseUserProfileDialog() {
    this.userProfileDialogOpen.set(false);
    this.arrowDownOpen.set(false);
  }

  toogleArrowDown() {
    this.arrowDownOpen.update((value) => !value);
  }
}
