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

@Component({
  selector: 'app-add-members',
  imports: [FormsModule],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss',
})
export class AddMembersComponent {
  private userService = inject(UserService);
  closeDialog = output<void>();
  channelName = input<string>();

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  isHovering = signal(false);
  isButtonDisabled = signal(true);

  userInput = signal('');

  selectedUsers = signal<UserProfile[]>([]);

  getUsers() {
    return this.userService.users;
  }

  filteredUsers = computed(() => {
    const userInput = this.userInput().toLowerCase().trim();
    if (!userInput) return [];
    return this.getUsers().filter((user) =>
      user.displayName.toLowerCase().includes(this.userInput().toLowerCase())
    );
  });

  pushSelectedUser(userId: string) {
    const user = this.userService.users.find((user) => user.uid === userId);
    if (user) {
      this.selectedUsers.update((current) => [...current, user]);
    }
  }

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
