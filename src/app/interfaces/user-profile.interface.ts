import { FieldValue } from '@angular/fire/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  heartbeat: FieldValue;
}
