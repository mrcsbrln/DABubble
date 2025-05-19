import { Component, inject, input, output, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-members',
  imports: [],
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

  getUsers() {
    return this.userService.users;
  }

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
