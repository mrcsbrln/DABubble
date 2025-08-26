import { inject, Injectable } from '@angular/core';
import { DirectMessageService } from './direct-message.service';
import { ChannelMessageService } from './channel-message.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private directMessageService = inject(DirectMessageService);
  private channelMessageService = inject(ChannelMessageService);
  private channelService = inject(ChannelService);
  //todo

  getChannelById(id: string) {
    return this.channelService.channels().find((channel) => channel.id === id);
  }
}
