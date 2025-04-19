import { Timestamp } from '@angular/fire/firestore';

export interface DirectMessageConversation {
  id: string; // Eindeutige ID der Konversation (Firestore Document ID)
  participantIds: [string, string]; // Array mit genau zwei UIDs der Teilnehmer (Referenz zu UserProfile.uid)
  lastMessageTimestamp?: Timestamp; // Optional: Zeitstempel der letzten Nachricht für Sortierungen in der UI
}
