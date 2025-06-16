import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';
import { CurrentUserProfileComponent } from '../current-user-profile/current-user-profile.component';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [CurrentUserProfileComponent, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  arrowDownOpen = signal(false);
  userProfileDialogOpen = signal(false);

  searchBarInput = new FormControl('');
  isSearchDialogOpen = signal(false);

  checkForAt() {
    const searchBarValue = this.searchBarInput.value || '';
    this.isSearchDialogOpen.set(searchBarValue?.includes('@'));
  }

  getCurrentUser() {
    return this.userService
      .users()
      .find((user) => user.uid === this.authService.currentUser()?.uid);
  }

  getUsers() {
    return this.userService.users();
  }

  toogleArrowDown() {
    this.arrowDownOpen.update((value) => !value);
  }

  onOpenDialog() {
    this.userProfileDialogOpen.set(true);
  }

  onCloseUserProfileDialog() {
    this.userProfileDialogOpen.set(false);
    this.arrowDownOpen.set(false);
  }

  onLogout() {
    this.authService.logout();
  }
}
