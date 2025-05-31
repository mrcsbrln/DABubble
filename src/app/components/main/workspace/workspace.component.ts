import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';
import { AddChannelComponent } from './add-channel/add-channel.component';
import { UserService } from '../../../services/user.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { DirectMessageService } from '../../../services/direct-message.service';

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

  getChannels() {
    return this.channelService.channels;
  }

  getCurrentUserData() {
    const currentUserId = this.userService.currentUserData()?.uid;
    if (!currentUserId) {
      return null;
    }
    return this.userService.getUserById(currentUserId);
  }

  getUsers() {
    return this.userService.users;
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

  channelListOpen = signal(false);
  directMessageUserListOpen = signal(false);
  addChannelDialogOpen = signal(false);

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
}
