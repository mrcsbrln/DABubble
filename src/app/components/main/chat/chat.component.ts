import { Component, computed, inject } from '@angular/core';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../interfaces/message.interface';
import { UserService } from '../../../services/user.service';


@Component({
  selector: 'app-chat',
  imports: [UserProfileComponent, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  userService = inject(UserService);
  currentUser = this.userService.currentUserData;

  displayName = computed(() => this.currentUser()?.displayName);
  // userUid = computed(() => this.currentUser()?.uid);

  newMessage: string = '';
  messages: Message[] = [];

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.messages.push({ username: this.displayName() });
      this.newMessage = '';
    }
    console.log(this.messages);
  }
}
