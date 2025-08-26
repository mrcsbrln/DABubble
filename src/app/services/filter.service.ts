import { inject, Injectable } from '@angular/core';
import { DirectMessageService } from './direct-message.service';
import { ChannelMessageService } from './channel-message.service';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private channelService = inject(ChannelService);
  private directMessageService = inject(DirectMessageService);
  private channelMessageService = inject(ChannelMessageService);
  private userService = inject(UserService);

  //TODO Refactoring: Move filter-logic from components to this services

  getChannelById(channelId: string) {
    return this.channelService
      .channels()
      .find((channel) => channel.id === channelId);
  }

  getUserById(userId: string) {
    return this.userService.users().find((user) => user.uid === userId);
  }
}
