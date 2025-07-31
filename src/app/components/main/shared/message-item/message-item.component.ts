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
  fadeInOut,
} from '../../../../services/site-animations.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

registerLocaleData(localeDe);

@Component({
  selector: 'app-message-item',
  animations: [
    reactionBarSlideCurrentUser,
    reactionBarSlideOtherUser,
    fadeInOut,
  ],
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
  isThreadItem = input<boolean>(false);
  isParentMessage = input<boolean>(false);
  openThread = output<void>();
  currentUser = this.authService.currentUser();

  isReactionHovered = signal(false);
  isReaction2Hovered = signal(false);
  isAnswerHovered = signal(false);
  isDotsHovered = signal(false);
  hoveredReactionIndex = signal<number | null>(null);
  reactionVisibleId = signal<string | null>(null);
  isEmojiPickerOpen = signal(false);

  readonly form = new FormGroup({
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
  });

  emojis: string[] = [
    '😀',
    '😂',
    '😢',
    '🤓',
    '😱',
    '👍',
    '👌',
    '👋',
    '🎉',
    '🚀',
    '🙏',
    '✅',
  ];

  addEmojiToInput(emoji: string) {
    const current = this.form.controls.content.value || '';
    this.form.controls.content.setValue(current + emoji);
    this.isEmojiPickerOpen.set(false);
  }

  checkForReactions(): boolean {
    const message = this.message();
    if (!message) {
      return false;
    }

    const reactions = message.reactions;

    if (!reactions) {
      return false;
    }

    return reactions.length > 0;
  }

  getDateOfMessage(): Date {
    const timestamp = this.message()?.timestamp;

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }

    return new Date(0);
  }

  getFormattedUserNames(emoji: string) {
    const userIds = this.getUserIdsOfReaction(emoji);
    if (!userIds) {
      return;
    }
    const names = userIds
      .map((id) => this.getUserInfos(id)?.displayName)
      .filter((name): name is string => !!name);

    if (names.length === 0) return '';

    let formattedNames: string;
    if (names.length === 1) {
      formattedNames = names[0];
    } else if (names.length === 2) {
      formattedNames = `${names[0]} und ${names[1]}`;
    } else {
      const allButLast = names.slice(0, -1).join(', ');
      const last = names[names.length - 1];
      formattedNames = `${allButLast} und ${last}`;
    }

    const verb = names.length > 1 ? 'haben' : 'hat';
    return `${formattedNames} ${verb} reagiert`;
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

  getThreadMessages() {
    return this.directMessageService
      .directMessages()
      .filter((dm) => dm.parentMessageId === this.message()?.id);
  }

  getTimeOfLastThreadMessage() {
    const timestamps = this.getThreadMessages()
      .map((m) => m.timestamp)
      .filter((ts): ts is Timestamp => ts instanceof Timestamp);

    if (timestamps.length === 0) return null;

    return timestamps.reduce((a, b) => (a.toMillis() > b.toMillis() ? a : b));
  }

  getUserInfos(id: string) {
    const users = this.userService.users();
    if (!users) {
      return;
    }
    return users.find((user) => user.uid === id);
  }

  getUserIdsOfReaction(emoji: string) {
    const reactions = this.message()?.reactions;
    return reactions?.find((reaction) => reaction.emoji === emoji)?.userIds;
  }

  handleReaction(emoji: string, messageId: string) {
    const message = this.message();
    if (!message) return;

    if ('senderId' in message) {
      this.channelMessageService.addReactionToMessage(emoji, messageId);
    } else if ('participantIds' in message) {
      this.directMessageService.addReactionToMessage(emoji, messageId);
    }
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

  toggleEmojiPicker() {
    this.isEmojiPickerOpen.update((value) => !value);
  }
}
