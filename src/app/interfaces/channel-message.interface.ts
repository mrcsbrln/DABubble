import { FieldValue, Timestamp } from '@angular/fire/firestore';
import { Reaction } from './reaction.interface';

export interface ChannelMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: FieldValue | Timestamp;
  channelId: string;
  parentMessageId: string | null;
  reactions: Reaction[];
}
