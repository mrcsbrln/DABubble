import { FieldValue } from '@angular/fire/firestore';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  memberIds: string[];
  createdAt: FieldValue;
}
