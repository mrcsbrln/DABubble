export class User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status?: 'online' | 'offline';

  constructor(
    id: string,
    username: string,
    email: string,
    avatarUrl: string,
    status: 'online' | 'offline'
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.avatarUrl = avatarUrl;
    this.status = status;
  }
}
