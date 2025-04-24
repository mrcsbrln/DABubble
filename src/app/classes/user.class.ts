import { UserProfile } from '../interfaces/user-profile.interface';

export class User implements UserProfile {
  uid = '';
  displayName = '';
  email = '';
  avatarUrl = '';
  status?: 'online' | 'offline';

  constructor(displayName: string, email: string) {
    this.displayName = displayName;
    this.email = email;
  }
}
