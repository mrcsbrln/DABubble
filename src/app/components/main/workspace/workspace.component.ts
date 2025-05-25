import { Component, inject, signal } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { AddChannelComponent } from './add-channel/add-channel.component';
import { UserService } from '../../../services/user.service';
import { RouterLink } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-workspace',
  imports: [AddChannelComponent, RouterLink, UserListComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  private userService = inject(UserService);
  private channelService = inject(ChannelService);
  private authService = inject(AuthService);

  getChannels() {
    return this.channelService.channels;
  }

  getUsers() {
    return this.userService.users;
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
  addChannelDialogOpen = signal(false);
  directMessageUserListOpen = signal(false);

  toggleChannelList() {
    this.channelListOpen.update((open) => !open);
  }

  onOpenChannelDialog() {
    this.addChannelDialogOpen.set(true);
  }

  onCloseAddChannel() {
    this.addChannelDialogOpen.set(false);
  }

  toggleDirectMessageUserList() {
    this.directMessageUserListOpen.update((open) => !open);
  }
}
