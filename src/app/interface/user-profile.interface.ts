export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  status?: 'online' | 'offline';
}
