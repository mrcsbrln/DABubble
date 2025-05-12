import { Component, EventEmitter, inject, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  @Output() closeDialog = new EventEmitter<void>();
  private userService = inject(UserService);

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
