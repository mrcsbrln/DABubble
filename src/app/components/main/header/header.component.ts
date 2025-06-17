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
  isSearchDialogOpen = signal(false);

  searchBarInput = new FormControl('');

  checkForAt() {
    const searchBarValue = this.searchBarInput.value || '';
    this.isSearchDialogOpen.set(searchBarValue?.includes('@'));
  }

  getCurrentUser() {
    return this.userService
      .users()
      .find((user) => user.uid === this.authService.currentUser()?.uid);
  }

  extractMention(input: string): string | null {
    const match = input.match(/@(\w+)$/);
    return match ? match[1] : null;
  }

  getFilteredUsers() {
    const input = this.searchBarInput.value || '';
    const mention = this.extractMention(input);
    if (input.endsWith('@')) {
      return this.userService.users();
    }
    if (!mention) {
      return [];
    }
    return this.userService
      .users()
      .filter((user) =>
        user.displayName.toLowerCase().startsWith(mention.toLowerCase())
      );
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
