import {
  Component,
  inject,
  signal,
  OnInit,
  LOCALE_ID,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { DirectMessageService } from '../../../services/direct-message.service';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { DirectMessage } from '../../../interfaces/direct-message.interface';
import { Subscription } from 'rxjs';

type DirectMessageData = Omit<DirectMessage, 'id'>;

registerLocaleData(localeDe);

@Component({
  selector: 'app-direct-message',
  imports: [CommonModule, DatePipe, ReactiveFormsModule, UserProfileComponent],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'de' }],
})
export class DirectMessageComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private directMessageService = inject(DirectMessageService);
  private destroyRef = inject(DestroyRef);

  private route = inject(ActivatedRoute);
  private routeSubscription!: Subscription;

  form = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  isUserProfileDialogOpen = signal(false);
  selectedMemberId = signal('');

  isHovering = signal(false);
  isEmojiPickerOpen = signal(false);

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
    this.routeSubscription = this.subRouteParams();
    this.destroyRef.onDestroy(() => {
      this.routeSubscription.unsubscribe();
    });
  }

  isSelectedUserCurrentUser() {
    return this.getSelectedUser()?.uid === this.getCurrentUserId();
  }

  getSelectedUser() {
    const selecetedUserId = this.directMessageService.selectedUserId();
    if (!selecetedUserId) return;
    return this.userService
      .users()
      .find((user) => user.uid === selecetedUserId);
  }

  getDirectMessagesOfSelectedUser() {
    return this.directMessageService.getDirectMessagesOfSelectedUser();
  }

  getDateOfMessageById(messageId: string) {
    const timestamp = this.directMessageService.directMessages.find(
      (message) => message.id === messageId
    )?.timestamp as Timestamp;
    return timestamp.toDate();
  }

  getCurrentUserId() {
    return this.authService.currentUser()?.uid;
  }

  subRouteParams() {
    return this.route.paramMap.subscribe((params: ParamMap) => {
      const userId = params.get('userId');
      if (userId) {
        this.directMessageService.selectedUserId.set(userId);
      } else {
        console.error('No user');
      }
    });
  }

  isOnline(id: string) {
    return this.userService.onlineUsersIds().includes(id);
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

  onSubmit() {
    const messageText = this.form.controls.content.value?.trim();
    const currentUserId = this.authService.currentUser()?.uid;
    const selectedUserId = this.directMessageService.selectedUserId();
    if (
      this.form.controls.content.valid &&
      messageText &&
      currentUserId &&
      selectedUserId
    ) {
      const directMessageDataToSend: DirectMessageData = {
        participantIds: [currentUserId, selectedUserId],
        content: messageText,
        timestamp: serverTimestamp(),
      };
      this.directMessageService.addMessage(directMessageDataToSend);
      this.form.controls.content.reset();
    }
  }
}
