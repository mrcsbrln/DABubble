import {
  Component,
  inject,
  signal,
  OnInit,
  DestroyRef,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { DirectMessage } from '../../../interfaces/direct-message.interface';
import { Subscription } from 'rxjs';
import { MessageBoxComponent } from '../shared/message-box/message-box.component';
import { MessageItemComponent } from '../shared/message-item/message-item.component';
import {
  reactionBarSlideCurrentUser,
  reactionBarSlideOtherUser,
} from '../../../services/site-animations.service';

type DirectMessageData = Omit<DirectMessage, 'id'>;

@Component({
  selector: 'app-direct-message',
  animations: [reactionBarSlideCurrentUser, reactionBarSlideOtherUser],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserProfileComponent,
    MessageBoxComponent,
    MessageItemComponent,
  ],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
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

  isEmojiPickerOpen = signal(false);

  openThread = output();

  ngOnInit() {
    this.routeSubscription = this.subRouteParams();
    this.destroyRef.onDestroy(() => {
      this.routeSubscription.unsubscribe();
    });
  }

  isSelectedUserCurrentUser(): boolean {
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
    return this.directMessageService
      .getDirectMessagesOfSelectedUser()
      .sort((a, b) => {
        const aTime =
          a.timestamp instanceof Timestamp ? a.timestamp.toDate().getTime() : 0;
        const bTime =
          b.timestamp instanceof Timestamp ? b.timestamp.toDate().getTime() : 0;
        return bTime - aTime;
      });
  }

  getCurrentUserPrivateMessages() {
    return this.directMessageService
      .getCurrentUserPrivateMessages()
      .sort((a, b) => {
        const aTime =
          a.timestamp instanceof Timestamp ? a.timestamp.toDate().getTime() : 0;
        const bTime =
          b.timestamp instanceof Timestamp ? b.timestamp.toDate().getTime() : 0;
        return bTime - aTime;
      });
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

  isUserOnline(id: string): boolean {
    return this.userService.onlineUsersIds().includes(id);
  }

  toggleUserProfileDialog() {
    this.isUserProfileDialogOpen.update((value) => !value);
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
        parentMessageId: null,
        reactions: [],
      };
      this.directMessageService.addMessage(directMessageDataToSend);
      this.form.controls.content.reset();
    }
  }

  handleSend(text: string) {
    const senderId = this.authService.currentUser()?.uid;
    const selectedMemberId = this.getSelectedUser()?.uid;

    if (!senderId || !selectedMemberId) return;

    const message: DirectMessageData = {
      content: text,
      participantIds: [senderId, selectedMemberId],
      timestamp: serverTimestamp(),
      parentMessageId: null,
      reactions: [],
    };

    this.directMessageService.addMessage(message);
  }

  setParentDirectMessageId(id: string) {
    this.directMessageService.parentDirectMessageId.set(id);
  }
}
