import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';
import { AddChannelComponent } from './add-channel/add-channel.component';
import { UserService } from '../../../services/user.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { DirectMessageService } from '../../../services/direct-message.service';
import { ChannelMessageService } from '../../../services/channel-message.service';

@Component({
  selector: 'app-workspace',
  imports: [AddChannelComponent, CommonModule, RouterLink],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  private userService = inject(UserService);
  private channelService = inject(ChannelService);
  private authService = inject(AuthService);
  private directMessageService = inject(DirectMessageService);
  private channelMessageService = inject(ChannelMessageService);

  channelListOpen = signal(true);
  directMessageUserListOpen = signal(true);
  addChannelDialogOpen = signal(false);
  isNewMessageBtnHovered = signal(false);
  closeThread = output<void>();

  getChannels() {
    return this.channelService.channels();
  }

  getCurrentUserData() {
    const currentUserId = this.userService.currentUserData()?.uid;
    if (!currentUserId) return;
    return this.userService.getUserById(currentUserId);
  }

  getUsers() {
    return this.userService.users;
  }

  isUserOnline(id: string) {
    return this.userService.onlineUsersIds().includes(id);
  }

  isUserSelected(id: string) {
    return this.directMessageService.selectedUserId() === id;
  }

  isChannelSelected(id: string) {
    return this.channelMessageService.currentChannelId() === id;
  }

  getUserDataOfOtherParcipitants() {
    return this.directMessageService.getUserDataOfOtherParcipitants();
  }

  checkIfUserIsMemberOfChannel(channelId: string): boolean {
    const currentUserUid = this.authService.currentUser()?.uid;
    const channelMembers =
      this.channelService.getChannelById(channelId)?.memberIds;
    if (currentUserUid && channelMembers) {
      return channelMembers.includes(currentUserUid);
    } else return false;
  }

  toggleChannelList() {
    this.channelListOpen.update((open) => !open);
  }

  toggleDirectMessageUserList() {
    this.directMessageUserListOpen.update((open) => !open);
  }

  onOpenChannelDialog() {
    this.addChannelDialogOpen.set(true);
  }

  onCloseAddChannel() {
    this.addChannelDialogOpen.set(false);
  }

  onCloseThread() {
    this.closeThread.emit();
  }

  resetCurrentChannelId() {
    this.channelMessageService.currentChannelId.set('');
  }

  resetSelectedUserId() {
    this.directMessageService.selectedUserId.set('');
  }
}
