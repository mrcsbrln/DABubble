import { Component, computed, inject, signal } from '@angular/core';
import { MessageBoxComponent } from '../shared/message-box/message-box.component';
import { UserService } from '../../../services/user.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { DirectMessageService } from '../../../services/direct-message.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { DirectMessage } from '../../../interfaces/direct-message.interface';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

type DirectMessageData = Omit<DirectMessage, 'id'>;

@Component({
  selector: 'app-new-message',
  imports: [MessageBoxComponent, ReactiveFormsModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private directMessageService = inject(DirectMessageService);
  private router = inject(Router);

  userInputControl = new FormControl('', { nonNullable: true });
  userInputSignal = toSignal(this.userInputControl.valueChanges, {
    initialValue: '',
  });
  selected = signal(false);

  filterUsernames = computed(() => {
    if (this.selected()) {
      return [];
    }

    const usernames = this.userService
      .users()
      .map((user) => user.displayName)
      .filter(Boolean) as string[];

    const userInput = this.userInputSignal().toLowerCase();

    return usernames.filter((username) =>
      username.toLowerCase().startsWith(userInput)
    );
  });

  handleSend(text: string) {
    const senderId = this.authService.currentUser()?.uid;
    const displayName = this.userInputControl.value;
    const selectedMemberId =
      this.userService.getUserByDisplayName(displayName)?.uid;

    if (!senderId || !selectedMemberId) return;

    const message: DirectMessageData = {
      content: text,
      participantIds: [senderId, selectedMemberId],
      timestamp: serverTimestamp(),
      parentMessageId: null,
      reactions: [],
    };

    this.directMessageService.addMessage(message);
    this.userInputControl.reset();
    this.resetSelection();
    this.router.navigateByUrl('/user/' + selectedMemberId);
  }

  resetSelection() {
    this.selected.set(false);
  }

  selectSuggestion(username: string) {
    this.userInputControl.setValue(username);
    this.selected.set(true);
  }
}
