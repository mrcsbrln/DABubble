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

type MessageData = Omit<Message, 'id'>;

registerLocaleData(localeDe);

@Component({
  selector: 'app-chat',
  imports: [AddMembersComponent, ReactiveFormsModule, DatePipe],
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
    return this.channelService.getChannelById()?.name;
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
      if (channelId) {
        this.messageService.currentChannelId.set(channelId);
      } else {
        console.log('No route');
      }
    });
  }

  isNewDay(index: number): boolean {
    const messages = this.getMessagesReversed();
    if (index === messages.length - 1) return true; // Letzte (ursprünglich älteste) Nachricht
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

  addReaction(messageIndex: number, reactionType: string, iconUrl: string) {
    messageIndex;
    reactionType;
    iconUrl;
    console.log('addReaction');
  }

  toogleAddMemebersDialog() {
    this.isAddMembersDialogOpen.update((value) => !value);
  }

  // addReaction(messageIndex: number, reactionType: string, iconUrl: string) {
  //   const msg = this.messages[messageIndex];
  //   if (!msg.reactions) msg.reactions = [];
  //   const found = msg.reactions.find((r) => r.type === reactionType);
  //   if (found) {
  //     found.count++;
  //   } else {
  //     msg.reactions.push({ type: reactionType, iconUrl, count: 1 });
  //   }
  // }
}
