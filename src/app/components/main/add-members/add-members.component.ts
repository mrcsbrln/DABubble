import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UserProfile } from '../../../interfaces/user-profile.interface';
import { ChannelService } from '../../../services/channel.service';

@Component({
  selector: 'app-add-members',
  imports: [FormsModule],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss',
})
export class AddMembersComponent {
  private userService = inject(UserService);
  private channelService = inject(ChannelService);
  closeDialog = output<void>();
  channelName = input<string>();

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  isHovering = signal(false);
  isButtonDisabled = signal(true);

  userInput = signal('');

  selectedUsers = signal<UserProfile[]>([]);

  selectAll = signal(false);

  filteredUsers = computed(() => {
    const userInput = this.userInput().toLowerCase().trim();
    if (!userInput) return [];
    return this.getUsers().filter((user) =>
      user.displayName.toLowerCase().includes(this.userInput().toLowerCase())
    );
  });

  filteredSelectableUsers = computed(() => {
    const selectedUsers = this.selectedUsers().map((user) => user.uid);
    return this.filteredUsers().filter(
      (user) => !selectedUsers.includes(user.uid)
    );
  });

  private getUsers() {
    return this.userService.users();
  }

  pushSelectedUser(userId: string) {
    const user = this.userService.users().find((user) => user.uid === userId);
    if (user) {
      this.selectedUsers.update((current) => [...current, user]);
      this.userInput.set('');
      this.isButtonDisabled.set(false);
    }
  }

  deleteSelectedUser(userId: string) {
    this.selectedUsers.update((current) =>
      current.filter((user) => user.uid !== userId)
    );
    if (this.selectedUsers().length < 1) {
      this.isButtonDisabled.set(true);
    }
  }

  onSave() {
    const channelId = this.channelService.getCurrentChannel();
    if (channelId) {
      this.selectedUsers().forEach((user) => {
        this.channelService.addUserToChannel(user.uid, channelId.id);
      });
    }
    this.onCloseDialog();
  }

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
