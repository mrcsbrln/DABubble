import { Component, inject } from '@angular/core';
import { MessageBoxComponent } from '../shared/message-box/message-box.component';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-new-message',
  imports: [MessageBoxComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  private channelService = inject(ChannelService);
  private userService = inject(UserService);
}
