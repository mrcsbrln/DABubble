import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  getCurrentUserName() {
    return this.userService.users.find(
      (user) => user.uid === this.authService.currentUser()?.uid
    )?.displayName;
  }

  onLogout() {
    this.authService.logout();
  }
}
