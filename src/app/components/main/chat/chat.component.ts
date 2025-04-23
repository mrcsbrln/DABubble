import { Component } from '@angular/core';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [UserProfileComponent, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  newMessage: string = '';
  messages: { text: string; outgoing: boolean }[] = [];



  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.messages.push({ text: this.newMessage, outgoing: true });
      this.newMessage = '';
    }
    console.log(this.messages);
  }
}
