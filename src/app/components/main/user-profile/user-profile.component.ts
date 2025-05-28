import { Component, inject, input, output, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  imports: [RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  userService = inject(UserService);

  selectedMemberId = input<string>();
  closeDialogUserProfile = output<void>();

  isHovering = signal(false);

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  getSelectedChannelMember() {
    return this.userService.users.find(
      (user) => user.uid === this.selectedMemberId()
    );
  }

  onCloseDialog() {
    this.closeDialogUserProfile.emit();
  }
}
