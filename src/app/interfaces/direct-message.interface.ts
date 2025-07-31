import { FieldValue, Timestamp } from '@angular/fire/firestore';
import { Reaction } from './reaction.interface';

export interface DirectMessage {
  id: string;
  participantIds: [string, string]; //[current-user, selected-user]
  content: string;
  timestamp: FieldValue | Timestamp;
  parentMessageId: string | null;
  reactions: Reaction[];
}
