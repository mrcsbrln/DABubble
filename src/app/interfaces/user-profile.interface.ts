import { FieldValue, Timestamp } from '@angular/fire/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  heartbeat: Timestamp | FieldValue | null;
}
