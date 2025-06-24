import { FieldValue, Timestamp } from '@angular/fire/firestore';
import { Reaction } from './reaction.interface';

export interface DirectMessage {
  id: string; // Eindeutige ID der Konversation (Firestore Document ID)
  participantIds: [string, string]; // Array mit genau zwei UIDs der Teilnehmer (Referenz zu UserProfile.uid)
  content: string;
  timestamp: FieldValue | Timestamp; // Optional: Zeitstempel der letzten Nachricht für Sortierungen in der UI
  parentMessageId?: string;
  reactions?: Reaction[]; // Array der Reaktionen auf diese Nachricht (optional)
}
