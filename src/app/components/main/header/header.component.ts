import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';
import { ChannelService } from '../../../services/channel.service';
import { CurrentUserProfileComponent } from '../current-user-profile/current-user-profile.component';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { DirectMessageService } from '../../../services/direct-message.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    CurrentUserProfileComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private directMessageService = inject(DirectMessageService);
  private channelService = inject(ChannelService);
  private channelMessageService = inject(ChannelMessageService);

  arrowDownOpen = signal(false);
  userProfileDialogOpen = signal(false);
  isAtInInput = signal(false);
  isHashInInput = signal(false);

  searchBarInput = new FormControl('');

  directMessages = this.directMessageService.directMessages;

  ngOnInit() {
    setTimeout(() => {
      console.log(this.directMessages());
    }, 1000);

    console.log('DirectMessages:', this.directMessages());
  }

  checkForAtOrHash() {
    const searchBarValue = this.searchBarInput.value || '';
    this.isAtInInput.set(searchBarValue?.includes('@'));
    this.isHashInInput.set(searchBarValue?.includes('#'));
  }

  getCurrentUser() {
    return this.userService
      .users()
      .find((user) => user.uid === this.authService.currentUser()?.uid);
  }

  extractMention(input: string) {
    const match = input.match(/@(\w+)/);
    return match ? match[1] : null;
  }

  extractChannelFromHash(input: string) {
    const match = input.match(/#(\w+)/);
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

  getFilteredChannels() {
    const input = (this.searchBarInput.value ?? '').trim();
    const searchTerm = this.extractChannelFromHash(input)?.toLowerCase();
    const currentUserId = this.authService.currentUser()?.uid;

    if (!currentUserId) return [];

    const currentUserChannels = this.channelService
      .channels()
      .filter((channel) => channel.memberIds.includes(currentUserId));

    if (input.endsWith('#') || !searchTerm) return currentUserChannels;

    return currentUserChannels.filter((channel) =>
      channel.name.toLowerCase().startsWith(searchTerm)
    );
  }

  getFilteredItems() {
    const input = (this.searchBarInput.value ?? '').trim().toLowerCase();
    if (!input || input.startsWith('@') || input.startsWith('#')) {
      return null;
    }

    const users = this.userService
      .users()
      .filter((user) => user.displayName.toLowerCase().startsWith(input));

    const channels = this.channelService
      .channels()
      .filter((channel) => channel.name.toLowerCase().startsWith(input));

    const channelMessages =
      this.channelMessageService
        .messages()
        .filter((msg) => msg.content.toLowerCase().includes(input)) ?? [];

    const directMessages =
      this.directMessages().filter((msg) =>
        msg.content.toLowerCase().includes(input)
      ) ?? [];

    return {
      users,
      channels,
      channelMessages,
      directMessages,
    };
  }

  isUserOnline(id: string) {
    return this.userService.onlineUsersIds().includes(id);
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

  toogleArrowDown() {
    this.arrowDownOpen.update((value) => !value);
  }
}
