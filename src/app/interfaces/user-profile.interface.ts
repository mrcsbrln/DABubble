import { FieldValue, Timestamp } from '@angular/fire/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  heartbeat: Timestamp | FieldValue | null;
}
