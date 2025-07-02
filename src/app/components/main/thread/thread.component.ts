import {
  Component,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
  ViewChild,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { ChannelService } from '../../../services/channel.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { ChannelMessage } from '../../../interfaces/channel-message.interface';
import { MessageBoxComponent } from '../shared/message-box/message-box.component';
import { DirectMessageService } from '../../../services/direct-message.service';
import { DirectMessage } from '../../../interfaces/direct-message.interface';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

type DirectMessageData = Omit<DirectMessage, 'id'>;

@Component({
  selector: 'app-thread',
  imports: [ReactiveFormsModule, MessageBoxComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements OnInit {
  private authService = inject(AuthService);
  private channelMessageService = inject(ChannelMessageService);
  private channelService = inject(ChannelService);
  private directMessageService = inject(DirectMessageService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('emojiPickerThread') emojiPickerRef!: ElementRef;
  @ViewChild('emojiToggleBtnThread') emojiToggleBtnRef!: ElementRef;

  closeThread = output<void>();

  isEmojiPickerOpen = signal(false);

  form = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  type: 'user' | 'channel' | null = null;
  id: string | null = null;

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

  ngOnInit(): void {
    this.checkRouteType();
  }

  onCloseThread() {
    this.closeThread.emit();
  }

  onSubmit() {
    const messageText = this.form.controls.content.value?.trim();
    const senderId = this.authService.currentUser()?.uid;
    const currentChannelId = this.channelMessageService.currentChannelId();
    const parentChannelMessageId =
      this.channelMessageService.parentChannelMessageId();
    if (
      this.form.controls.content.valid &&
      messageText &&
      senderId &&
      currentChannelId
    ) {
      const messageDataToSend: Omit<ChannelMessage, 'id'> = {
        senderId: senderId,
        content: messageText,
        timestamp: serverTimestamp(),
        channelId: currentChannelId,
        parentMessageId: parentChannelMessageId,
      };
      this.channelMessageService.addMessage(messageDataToSend);
      this.form.controls.content.reset();
    } else if (!senderId) {
      console.error('User not found');
    }
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

  getChannelName() {
    return this.channelService.getCurrentChannel()?.name;
  }

  getParentChannelMessage() {
    return this.channelMessageService.parentMessage();
  }

  getParentDirectMessage() {
    return this.directMessageService.parentMessage();
  }

  getDirectThreadMessages() {
    return this.directMessageService.threadMessages();
  }

  getChannelThreadMessages() {
    return this.channelMessageService.threadMessages();
  }

  getSelectedUser() {
    const selecetedUserId = this.directMessageService.selectedUserId();
    if (!selecetedUserId) return;
    return this.userService
      .users()
      .find((user) => user.uid === selecetedUserId);
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

  handleSendForDirectMessage(text: string) {
    const senderId = this.authService.currentUser()?.uid;
    const selectedMemberId = this.getSelectedUser()?.uid;
    const parentMessageId = this.getParentDirectMessage()?.id;

    console.log('1', senderId, '2', selectedMemberId, '3', parentMessageId);

    if (!senderId || !selectedMemberId || !parentMessageId) return;

    const message: DirectMessageData = {
      content: text,
      participantIds: [senderId, selectedMemberId],
      timestamp: serverTimestamp(),
      parentMessageId: parentMessageId || undefined,
    };

    this.directMessageService.addMessage(message);
  }

  handleSendForChannelMessage(text: string) {
    return text;
  }

  checkRouteType(): void {
    const url = this.router.url;

    if (url.startsWith('/user/')) {
      this.type = 'user';
      this.id = this.route.snapshot.paramMap.get('id');
    } else if (url.startsWith('/channels/')) {
      this.type = 'channel';
      this.id = this.route.snapshot.paramMap.get('id');
    } else {
      this.type = null;
      this.id = null;
    }
  }
}
