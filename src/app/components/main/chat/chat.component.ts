import { Component, computed, inject } from '@angular/core';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../interfaces/message.interface';
import { UserService } from '../../../services/user.service';
import { Timestamp } from '@angular/fire/firestore'; // Importiere Timestamp
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [UserProfileComponent, FormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  userService = inject(UserService);
  currentUser = this.userService.currentUserData;

  displayName = computed(() => this.currentUser()?.displayName);
  userUid = computed(() => this.currentUser()?.uid);

  newMessage: string = '';
  messages: Message[] = [];

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      const timestamp = Timestamp.now(); // Erzeuge einen Zeitstempel
      this.messages.push({
        username: this.displayName(),
        content: this.newMessage,
        timestamp: timestamp, // Füge den Zeitstempel hinzu
      });
      this.newMessage = '';
    }
    console.log(this.messages);
    console.log(this.userUid());
  }
}
