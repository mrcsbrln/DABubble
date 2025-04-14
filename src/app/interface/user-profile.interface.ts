export interface UserProfil {
  uid?: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status?: 'online' | 'offline';
}
