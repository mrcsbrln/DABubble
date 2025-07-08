import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  LOCALE_ID,
  signal,
  ViewChild,
  output,
  DestroyRef,
} from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { Timestamp, FieldValue } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
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
import { AddMembersComponent } from '../add-members/add-members.component';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { MessageBoxComponent } from '../shared/message-box/message-box.component';
import {
  reactionBarSlideCurrentUser,
  reactionBarSlideOtherUser,
} from '../../../services/site-animations.service';
import { MessageItemComponent } from '../shared/message-item/message-item.component';

type ChannelMessageData = Omit<ChannelMessage, 'id'>;

@Component({
  selector: 'app-channel-message',
  animations: [reactionBarSlideCurrentUser, reactionBarSlideOtherUser],
  imports: [
    AddMembersComponent,
    ReactiveFormsModule,
    EditChannelComponent,
    UserProfileComponent,
    CommonModule,
    MessageBoxComponent,
    MessageItemComponent,
  ],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'de' }],
})
export class ChannelMessageComponent implements OnInit {
  private authService = inject(AuthService);
  private channelMessageService = inject(ChannelMessageService);
  private route = inject(ActivatedRoute);
  private channelService = inject(ChannelService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

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
  messageContent = signal('');
  saveMessageContentTemporarily = signal('');

  editMessageId = signal<string | null>(null);

  selectedMemberId = signal('');

  isHovering = signal(false);
  isEmojiPickerOpen = signal(false);
  isReactionHovered = signal(false);
  isAnswerHovered = signal(false);
  isDotsHovered = signal(false);

  reactionVisibleId = signal<string | null>(null);

  openThread = output<void>();

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  ngOnInit() {
    this.subRouteParams();
    this.destroyRef.onDestroy(() => {
      this.subRoute?.unsubscribe();
    });
  }

  getMessagesByChannelId() {
    return this.channelMessageService.messagesByChannelId();
  }

  getMembersOfCurrentChannel() {
    const currentChannelId = this.channelMessageService.currentChannelId();
    if (currentChannelId === null) return;
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

  getMessageContent() {
    this.messageContent.set(this.saveMessageContentTemporarily());
    this.editMessageId.set(null);
  }

  getChannelName() {
    return this.channelService.getCurrentChannel()?.name;
  }

  getUserBySenderId(senderId: string) {
    return this.userService.users().find((user) => user.uid === senderId);
  }

  getDateOfMessageById(messageId: string): Date {
    const timestamp = this.channelMessageService
      .messages()
      .find((message) => message.id === messageId)?.timestamp;

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }

    return new Date(0);
  }

  getParentChannelMessageId() {
    return this.channelMessageService.parentChannelMessageId();
  }

  isCurrentUserSenderOfMessage(messageId: string): boolean {
    const currentUserId = this.authService.currentUser()?.uid;
    const message = this.getMessagesByChannelId().find(
      (message) => message.id === messageId
    );
    return message?.senderId === currentUserId;
  }

  onOpenThread() {
    this.openThread.emit();
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
        parentMessageId: null,
      };
      this.channelMessageService.addMessage(messageDataToSend);
      this.form.controls.content.reset();
    } else if (!senderId) {
      console.error('User not found');
    }
  }

  setEditMode(messageId: string) {
    this.editMessageId.set(messageId);
    const messageToEdit = this.getMessagesByChannelId().find(
      (msg) => msg.id === messageId
    );
    if (messageToEdit) {
      this.messageContent.set(messageToEdit.content);
      this.saveMessageContentTemporarily.set(messageToEdit.content);
    }
  }

  onInputName(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.messageContent.set(newValue);
  }

  setCurrentParentChannelMessageId(id: string) {
    this.channelMessageService.parentChannelMessageId.set(id);
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

  getAmountOfThreadMessages(parentId: string) {
    return this.channelMessageService
      .messages()
      .filter((message) => message.parentMessageId === parentId).length;
  }

  isToday(messageId: string): boolean {
    const message = this.channelMessageService
      .messages()
      .find((message) => message.id === messageId);

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

  setSelectedMemeberId(memberId: string) {
    if (!memberId) return;
    this.selectedMemberId.set(memberId);
  }

  toogleAddMemebersDialog() {
    this.isAddMembersDialogOpen.update((value) => !value);
  }

  toggleEditChannelDialog() {
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

  async onUpdateMessage() {
    const messageId = this.editMessageId();
    const newContent = this.messageContent();
    if (messageId && newContent.trim()) {
      this.editMessageId.set(null);
      await this.channelMessageService.updateMessage(
        messageId,
        newContent.trim()
      );
      this.messageContent.set('');
      this.saveMessageContentTemporarily.set('');
    } else {
      this.editMessageId.set(null);
      this.messageContent.set('');
      this.saveMessageContentTemporarily.set('');
    }
  }

  getCurrentUserData() {
    const currentUserId = this.userService.currentUserData()?.uid;
    if (!currentUserId) {
      return null;
    }
    return this.userService.getUserById(currentUserId);
  }

  isUserOnline(id: string) {
    return this.userService.onlineUsersIds().includes(id);
  }

  isMessageFromCurrentUser(senderId: string) {
    return this.authService.currentUser()?.uid === senderId;
  }

  setParentDirectMessageId(id: string) {
    this.channelMessageService.parentChannelMessageId.set(id);
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

  handleSend(text: string) {
    const currentChannelId = this.channelMessageService.currentChannelId();
    const senderId = this.authService.currentUser()?.uid;

    if (!currentChannelId || !senderId) return;

    const message: ChannelMessageData = {
      senderId,
      content: text,
      timestamp: serverTimestamp(),
      channelId: currentChannelId,
      parentMessageId: null,
    };

    this.channelMessageService.addMessage(message);
  }
}
