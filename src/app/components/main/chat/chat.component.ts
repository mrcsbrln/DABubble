import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from '../../../services/message.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { Timestamp, FieldValue } from '@angular/fire/firestore';
import { DatePipe, registerLocaleData } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Message } from '../../../interfaces/message.interface';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';
import localeDe from '@angular/common/locales/de';
import { AddMembersComponent } from '../add-members/add-members.component';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

type MessageData = Omit<Message, 'id'>;

registerLocaleData(localeDe);

@Component({
  selector: 'app-chat',
  imports: [
    AddMembersComponent,
    ReactiveFormsModule,
    DatePipe,
    EditChannelComponent,
    UserProfileComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'de' }],
})
export class ChatComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private channelService = inject(ChannelService);
  private userService = inject(UserService);

  form = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  subRoute!: Subscription;

  isAddMembersDialogOpen = signal(false);
  isEditChannelDialogOpen = signal(false);
  isShowMembersDialogOpen = signal(false);
  isUserProfileDialogOpen = signal(false);

  isHovering = signal(false);

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  isShowEmojiPicker = signal(true);
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

  ngOnInit() {
    this.subRouteParams();
  }

  ngOnDestroy() {
    if (this.subRoute) {
      this.subRoute.unsubscribe();
    }
  }

  getMessagesByChannelId() {
    return this.messageService.messagesByChannelId;
  }

  getMembersOfCurrentChannel() {
    const currentChannelId = this.messageService.currentChannelId();
    const memberIdsOfChannel =
      this.channelService.getMembersOfChannel(currentChannelId);
    return memberIdsOfChannel?.map((id) => this.userService.getUserById(id));
  }

  getSortedMessagesByChannelId() {
    return this.getMessagesByChannelId()
      .slice()
      .sort((a, b) => {
        const dateA = this.getDateOfMessageById(a.id);
        const dateB = this.getDateOfMessageById(b.id);
        return dateA.getTime() - dateB.getTime();
      });
  }

  getMessagesReversed() {
    return this.getSortedMessagesByChannelId().slice().reverse();
  }

  getChannelName() {
    return this.channelService.getCurrentChannel()?.name;
  }

  getUserBySenderId(senderId: string) {
    return this.userService.users.find((user) => user.uid === senderId);
  }

  getDateOfMessageById(messageId: string) {
    const timestamp = this.messageService.messages.find(
      (message) => message.id === messageId
    )?.timestamp as Timestamp;
    return timestamp.toDate();
  }

  isCurrentUserSenderOfMessage(messageId: string): boolean {
    const currentUserId = this.authService.currentUser()?.uid;
    const message = this.getMessagesByChannelId().find(
      (message) => message.id === messageId
    );
    return message?.senderId === currentUserId;
  }

  onSubmit() {
    const messageText = this.form.controls.content.value?.trim();
    const senderId = this.authService.currentUser()?.uid;
    const currentChannelId = this.messageService.currentChannelId();
    if (
      this.form.controls.content.valid &&
      messageText &&
      senderId &&
      currentChannelId
    ) {
      const messageDataToSend: MessageData = {
        senderId: senderId,
        content: messageText,
        timestamp: serverTimestamp(),
        channelId: currentChannelId,
      };
      this.messageService.addMessage(messageDataToSend);
      this.form.controls.content.reset();
    } else if (!senderId) {
      console.error('User not found');
    }
  }

  subRouteParams() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const channelId = params.get('channel');
      const username = params.get('username');
      const userId = params.get('userId');
      if (channelId) {
        this.messageService.currentChannelId.set(channelId);
      } else if (username && userId) {
        this.messageService.selectedUsername.set(username);
        this.messageService.selectedUserId.set(userId);
      } else {
        console.log('No route');
      }
    });
  }

  isNewDay(index: number): boolean {
    const messages = this.getMessagesReversed();
    if (index === messages.length - 1) return true;
    const currentTimestamp = messages[index]?.timestamp;
    const nextTimestamp = messages[index + 1]?.timestamp;

    if (!currentTimestamp || !nextTimestamp) return false;

    const currentDate = this.getDateOnly(currentTimestamp);
    const nextDate = this.getDateOnly(nextTimestamp);

    return currentDate.getTime() !== nextDate.getTime();
  }

  getDateOnly(timestamp: Timestamp | FieldValue | Date): Date {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    if (timestamp instanceof Date) {
      return new Date(
        timestamp.getFullYear(),
        timestamp.getMonth(),
        timestamp.getDate()
      );
    }
    return new Date(0);
  }

  toogleAddMemebersDialog() {
    this.isAddMembersDialogOpen.update((value) => !value);
  }

  toogleEditChannelDialog() {
    this.isEditChannelDialogOpen.update((value) => !value);
  }

  toggleShowMembersDialog() {
    this.isShowMembersDialogOpen.update((value) => !value);
  }

  toggleUserProfileDialog() {
    this.isUserProfileDialogOpen.update((value) => !value);
  }

  // toggleEmojiPicker() {
  //   this.isShowEmojiPicker.update((value) => !value);
  // }

  addEmojiToInput(emoji: string, btn: HTMLButtonElement) {
  const current = this.form.controls.content.value || '';
  this.form.controls.content.setValue(current + emoji);
  btn.blur(); // Entfernt den Fokus, Emoji-Picker schließt sich durch :focus CSS
}
}
