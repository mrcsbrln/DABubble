import { inject, Injectable } from '@angular/core';
import { DirectMessageService } from './direct-message.service';
import { ChannelMessageService } from './channel-message.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private directMessageService = inject(DirectMessageService);
  private channelMessageService = inject(ChannelMessageService);
  //todo
}
