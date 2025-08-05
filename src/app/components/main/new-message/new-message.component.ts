import { Component, computed, inject, signal } from '@angular/core';
import { MessageBoxComponent } from '../shared/message-box/message-box.component';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-message',
  imports: [MessageBoxComponent, ReactiveFormsModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  private channelService = inject(ChannelService);
  private userService = inject(UserService);

  userInputControl = new FormControl('', { nonNullable: true });
  selected = signal(false);

  filterUsernames = computed(() => {
    if (this.selected()) {
      return [];
    }

    const usernames = this.userService
      .users()
      .map((user) => user.displayName)
      .filter(Boolean) as string[];

    const userInput = this.userInputControl.value.toLowerCase();

    return usernames.filter((username) =>
      username.toLowerCase().includes(userInput)
    );
  });

  resetSelection() {
    this.selected.set(false);
  }

  selectSuggestion(username: string) {
    this.userInputControl.setValue(username);
    this.selected.set(true);
  }
}
