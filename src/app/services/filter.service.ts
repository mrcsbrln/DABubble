import { inject, Injectable } from '@angular/core';
import { DirectMessageService } from './direct-message.service';
import { ChannelMessageService } from './channel-message.service';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';
import { AuthService } from './auth/auth.service';
import { Channel } from '../interfaces/channel.interface';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private authService = inject(AuthService);
  private channelService = inject(ChannelService);
  private directMessageService = inject(DirectMessageService);
  private channelMessageService = inject(ChannelMessageService);
  private userService = inject(UserService);

  //TODO Refactoring: Move filter-logic from components to this services

  getChannelById(channelId: string): Channel | undefined {
    return this.channelService
      .channels()
      .find((channel) => channel.id === channelId);
  }

  getChannelsOfCurrentUser(): Channel[] {
    const currentUserId = this.authService.currentUser()?.uid;
    if (currentUserId !== undefined) {
      return this.channelService
        .channels()
        .filter((channel) => channel.memberIds.includes(currentUserId));
    }
    return [];
  }

  getUserById(userId: string) {
    return this.userService.users().find((user) => user.uid === userId);
  }
}
