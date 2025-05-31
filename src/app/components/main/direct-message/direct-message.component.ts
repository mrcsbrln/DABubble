import { Component, inject, signal, OnInit } from '@angular/core';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { DirectMessageService } from '../../../services/direct-message.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { serverTimestamp } from '@angular/fire/firestore';
import { DirectMessage } from '../../../interfaces/direct-message.interface';

type DirectMessageData = Omit<DirectMessage, 'id'>;

@Component({
  selector: 'app-direct-message',
  imports: [ReactiveFormsModule, UserProfileComponent],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
})
export class DirectMessageComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  directMessageService = inject(DirectMessageService);

  route = inject(ActivatedRoute);

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
    this.subRouteParams();
  }

  getSelectedUser() {
    const selecetedUserId = this.directMessageService.selectedUserId();
    if (!selecetedUserId) return;
    return this.userService.users.find((user) => user.uid === selecetedUserId);
  }

  subRouteParams() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const userId = params.get('userId');
      if (userId) {
        this.directMessageService.selectedUserId.set(userId);
      } else {
        console.log('No user');
      }
    });
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
