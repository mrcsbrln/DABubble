import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { MessageService } from '../../../services/message.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
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

type MessageData = Omit<Message, 'id'>;

@Component({
  selector: 'app-chat',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
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

  ngOnInit() {
    this.subRouteParams();
  }

  ngOnDestroy() {
    if (this.subRoute) {
      this.subRoute.unsubscribe();
    }
  }

  getMessagesByChannelId() {
    console.log(this.messageService.messagesByChannelId);
    return this.messageService.messagesByChannelId;
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

  // isNewDay(index: number): boolean {
  //   if (index === 0) return true;
  //   const current = this.messages[index].timestamp?.toDate();
  //   const prev = this.messages[index - 1].timestamp?.toDate();
  //   if (!current || !prev) return false;
  //   return (
  //     current.getFullYear() !== prev.getFullYear() ||
  //     current.getMonth() !== prev.getMonth() ||
  //     current.getDate() !== prev.getDate()
  //   );
  // }

  // editMessage(index: number): void {
  //   if (this.messages[index].senderId === this.userUid()) {
  //     console.log('Message belongs to logged-in user');
  //   } else {
  //     console.log('Message belongs NOT to logged-in user');
  //   }
  //   console.log('Message index:', index);
  // }

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
