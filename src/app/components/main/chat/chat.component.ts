import { Component, computed, inject } from '@angular/core';
// import { UserProfileComponent } from '../user-profile/user-profile.component';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../interfaces/message.interface';
import { UserService } from '../../../services/user.service';
import { Timestamp } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  userService = inject(UserService);
  currentUser = this.userService.currentUserData;

  displayName = computed(() => this.currentUser()?.displayName);
  userUid = computed(() => this.currentUser()?.uid);
  avatarUrl = computed(() => this.currentUser()?.avatarUrl);

  newMessage: string = '';
  messages: Message[] = [
    {
      username: this.displayName(),
      senderId: this.userUid(),
      content: 'onclick message test  => console log',
      avatarUrl: 'img/chat/sofia-mueller-chat.svg'
    }
  ];

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      const timestamp = Timestamp.now();
      console.log(timestamp, );

      this.messages.push({
        username: this.displayName(),
        content: this.newMessage,
        timestamp: timestamp,
        senderId: this.userUid(),
        avatarUrl: this.avatarUrl(),
      });
      this.newMessage = '';
    }
    console.log(this.messages);
  }

  editMessage(index: number): void {
    if (this.messages[index].senderId === this.userUid()) {
      console.log("Message belongs to logged-in user");
    } else {
      console.log("Message belongs NOT to logged-in user");
    }
    console.log('Message index:', index);
  }
}
