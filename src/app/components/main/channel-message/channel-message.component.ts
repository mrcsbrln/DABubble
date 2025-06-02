import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  LOCALE_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { Timestamp, FieldValue } from '@angular/fire/firestore';
import { DatePipe, registerLocaleData } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChannelMessage } from '../../../interfaces/channel-message.interface';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';
import localeDe from '@angular/common/locales/de';
import { AddMembersComponent } from '../add-members/add-members.component';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

type ChannelMessageData = Omit<ChannelMessage, 'id'>;

registerLocaleData(localeDe);

@Component({
  selector: 'app-channel-message',
  imports: [
    AddMembersComponent,
    ReactiveFormsModule,
    DatePipe,
    EditChannelComponent,
    UserProfileComponent,
  ],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'de' }],
})
export class ChannelMessageComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private channelMessageService = inject(ChannelMessageService);
  private route = inject(ActivatedRoute);
  private channelService = inject(ChannelService);
  private userService = inject(UserService);

  @ViewChild('emojiPicker') emojiPickerRef!: ElementRef;
  @ViewChild('emojiToggleBtn') emojiToggleBtnRef!: ElementRef;

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

  selectedMemberId = signal('');

  isHovering = signal(false);
  isEmojiPickerOpen = signal(false);

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

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
    return this.channelMessageService.messagesByChannelId;
  }

  getMembersOfCurrentChannel() {
    const currentChannelId = this.channelMessageService.currentChannelId();
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

// TODO added for childcomponent
  getChannelDescription() {
    return this.channelService.getCurrentChannel()?.description ?? undefined;
  }
// TODO added for childcomponent
  getCreatorName() {
  const creatorId = this.channelService.getCurrentChannel()?.creatorId;
  return creatorId ? this.getUserBySenderId(creatorId)?.displayName : undefined;
}

  getUserBySenderId(senderId: string) {
    return this.userService.users.find((user) => user.uid === senderId);
  }

  getDateOfMessageById(messageId: string) {
    const timestamp = this.channelMessageService.messages.find(
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
    const currentChannelId = this.channelMessageService.currentChannelId();
    if (
      this.form.controls.content.valid &&
      messageText &&
      senderId &&
      currentChannelId
    ) {
      const messageDataToSend: ChannelMessageData = {
        senderId: senderId,
        content: messageText,
        timestamp: serverTimestamp(),
        channelId: currentChannelId,
      };
      this.channelMessageService.addMessage(messageDataToSend);
      this.form.controls.content.reset();
    } else if (!senderId) {
      console.error('User not found');
    }
  }

  subRouteParams() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const channelId = params.get('channel');
      if (channelId) {
        this.channelMessageService.currentChannelId.set(channelId);
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

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  setSelectedMemeberId(memberId: string) {
    if (!memberId) return;
    this.selectedMemberId.set(memberId);
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

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.isEmojiPickerOpen.update((open) => !open);
  }

  addEmojiToInput(emoji: string) {
    const current = this.form.controls.content.value || '';
    this.form.controls.content.setValue(current + emoji);
    this.isEmojiPickerOpen.set(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const picker = this.emojiPickerRef?.nativeElement;
    const btn = this.emojiToggleBtnRef?.nativeElement;
    if (
      this.isEmojiPickerOpen() &&
      picker &&
      !picker.contains(event.target) &&
      btn &&
      !btn.contains(event.target)
    ) {
      this.isEmojiPickerOpen.set(false);
    }
  }

  @HostListener('blur', ['$event.target'])
  onBlur(target: HTMLElement) {
    if (target === this.emojiToggleBtnRef.nativeElement) {
      this.emojiToggleBtnRef.nativeElement.querySelector('img').src =
        '/img/add-reaction.svg';
    }
  }
}
