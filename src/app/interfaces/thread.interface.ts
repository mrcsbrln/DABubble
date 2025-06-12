import { Timestamp } from '@angular/fire/firestore';

export interface Thread {
  id: string; // Eindeutige ID des Threads (könnte die ID der Ursprungsnachricht sein)
  parentMessageId: string; // ID der Nachricht, die den Thread gestartet hat (Referenz zu Message.id)
  participantIds: string[]; // UIDs der Benutzer, die im Thread geantwortet haben
  lastReplyTimestamp?: Timestamp; // Zeitstempel der letzten Antwort im Thread
  replyCount: number; // Anzahl der Antworten im Thread
}
