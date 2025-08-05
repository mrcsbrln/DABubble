import { Component, computed, inject, signal } from '@angular/core';
import { MessageBoxComponent } from '../shared/message-box/message-box.component';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-new-message',
  imports: [MessageBoxComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  private channelService = inject(ChannelService);
  private userService = inject(UserService);

  inputText = signal('');
  selected = signal(false);

  filteredUsernames = computed(() => {
    if (this.selected()) return [];
    const allUsernames = computed(() =>
      this.userService
        .users()
        .map((u) => u.displayName)
        .filter(Boolean)
    );
    const query = this.inputText().toLowerCase();
    return allUsernames().filter((name) => name.toLowerCase().includes(query));
  });

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputText.set(value);
    this.selected.set(false);
  }

  selectSuggestion(username: string) {
    this.inputText.set(username);
    this.selected.set(true);
  }
}
