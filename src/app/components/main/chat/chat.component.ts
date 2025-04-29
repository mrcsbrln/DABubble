import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Message } from '../../../interfaces/message.interface';

type MessageData = Omit<Message, 'id'>;

@Component({
  selector: 'app-chat',
  imports: [ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  messageService = inject(MessageService);

  formControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
  ]);

  sendMessage() {
    console.log('Wurde aufgerufen');
    const messageText = this.formControl.value?.trim();
    const senderId = this.authService.currentUser()?.uid;
    if (this.formControl.valid && messageText && senderId) {
      const messageDataToSend: MessageData = {
        senderId: senderId,
        content: messageText,
        timestamp: serverTimestamp(),
      };
      this.messageService.addMessage(messageDataToSend);
      this.formControl.reset();

      console.log(messageDataToSend);
    } else if (!senderId) {
      console.error('Benutzter nicht gefunden!');
    }
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
