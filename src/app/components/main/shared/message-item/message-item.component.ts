import {
  Component,
  inject,
  input,
  LOCALE_ID,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectMessage } from '../../../../interfaces/direct-message.interface';
import { ChannelMessage } from '../../../../interfaces/channel-message.interface';
import { Timestamp } from '@angular/fire/firestore';
import { DatePipe, registerLocaleData } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth.service';
import { ChannelMessageService } from '../../../../services/channel-message.service';
import { DirectMessageService } from '../../../../services/direct-message.service';
import { UserService } from '../../../../services/user.service';
import localeDe from '@angular/common/locales/de';
import {
  reactionBarSlideCurrentUser,
  reactionBarSlideOtherUser,
} from '../../../../services/site-animations.service';

registerLocaleData(localeDe);

@Component({
  selector: 'app-message-item',
  animations: [reactionBarSlideCurrentUser, reactionBarSlideOtherUser],
  imports: [CommonModule, DatePipe],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'de' }],
})
export class MessageItemComponent {
  private authService = inject(AuthService);
  private channelMessageService = inject(ChannelMessageService);
  private directMessageService = inject(DirectMessageService);
  private userService = inject(UserService);

  message = input<ChannelMessage | DirectMessage>();
  openThread = output<void>();

  isReactionHovered = signal(false);
  isAnswerHovered = signal(false);
  isDotsHovered = signal(false);
  reactionVisibleId = signal<string | null>(null);

  getDateOfMessage(): Date {
    const timestamp = this.message()?.timestamp;

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }

    return new Date(0);
  }

  getSenderOfMessage() {
    const message = this.message();
    if (!message) return;

    if ('senderId' in message) {
      return this.userService
        .users()
        .find((user) => user.uid === message.senderId);
    } else if ('participantIds' in message) {
      return this.userService
        .users()
        .find((user) => user.uid === message.participantIds[0]);
    } else return;
  }

  isMessageFromCurrentUser(): boolean {
    const message = this.message();
    const currentUserId = this.authService.currentUser()?.uid;

    if (!message || !currentUserId) return false;

    if ('senderId' in message) {
      return message.senderId === currentUserId;
    } else if ('participantIds' in message) {
      return message.participantIds[0] === currentUserId;
    }

    return false;
  }

  isToday(): boolean {
    const message = this.message();
    if (!message?.timestamp || !(message?.timestamp instanceof Timestamp)) {
      return false;
    }

    const messageDate = message.timestamp.toDate();
    const today = new Date();

    return (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    );
  }

  onMouseEnterMessage() {
    const message = this.message();
    if (message?.id) {
      this.reactionVisibleId.set(message.id);
    }
  }

  onMouseLeaveMessage() {
    this.reactionVisibleId.set(null);
  }

  onOpenThread() {
    this.openThread.emit();
  }

  setParentDirectMessageId() {
    const message = this.message();

    if (!message) return;

    if ('senderId' in message) {
      this.channelMessageService.parentChannelMessageId.set(message.id);
    } else if ('participantIds' in message) {
      this.directMessageService.parentDirectMessageId.set(message.id);
    }
  }
}
