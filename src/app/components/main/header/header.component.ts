import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-header',
  imports: [UserProfileComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  arrowDownOpen = signal(false);
  userProfileDialogOpen = signal(false);

  getCurrentUser() {
    return this.userService.users.find(
      (user) => user.uid === this.authService.currentUser()?.uid
    );
  }

  toogleArrowDown() {
    this.arrowDownOpen.update((value) => !value);
  }

  onOpenDialog() {
    this.userProfileDialogOpen.set(true);
  }

  onLogout() {
    this.authService.logout();
  }
}
