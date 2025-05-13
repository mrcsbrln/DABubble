import { Component, inject } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { UserProfile } from '../../../../interfaces/user-profile.interface';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private userService = inject(UserService);

  getUsers() {
    return this.userService.users;
  }

  getStatusColor(user: UserProfile): string {
    switch (user.status) {
      case 'online':
        return '#92c83e';
      case 'offline':
        return '#686868';
      default:
        return '#686868';
    }
  }
}
