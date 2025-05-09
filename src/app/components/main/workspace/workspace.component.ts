import { Component, inject, signal } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { AddChannelComponent } from './add-channel/add-channel.component';
import { UserService } from '../../../services/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-workspace',
  imports: [AddChannelComponent, RouterLink],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  private userService = inject(UserService);
  private channelService = inject(ChannelService);

  addChannelDialogOpen = signal(false);

  getChannels() {
    return this.channelService.channels;
  }

  getUsers() {
    return this.userService.users;
  }

  onOpenChannelDialog() {
    this.addChannelDialogOpen.set(true);
  }

  onCloseAddChannel() {
    this.addChannelDialogOpen.set(false);
  }
}
