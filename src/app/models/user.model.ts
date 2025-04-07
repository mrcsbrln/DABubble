export class User {
  username: string;
  email: string;
  avatarUrl?: string;
  status?: 'online' | 'offline';

  constructor(
    username: string,
    email: string,
    avatarUrl: string,
    status: 'online' | 'offline'
  ) {
    this.username = username;
    this.email = email;
    this.avatarUrl = avatarUrl;
    this.status = status;
  }
}
