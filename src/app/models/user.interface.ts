export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away';
}
