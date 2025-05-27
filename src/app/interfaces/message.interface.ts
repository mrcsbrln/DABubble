import { FieldValue } from '@angular/fire/firestore';
// import { Reaction } from './reaction.interface';

export interface Message {
  id: string; // Eindeutige ID der Nachricht (Firestore Document ID)
  senderId: string; // UID des Absenders (Referenz zu UserProfile.uid)
  content: string; // Textinhalt der Nachricht
  timestamp: FieldValue; // Zeitstempel, wann die Nachricht gesendet wurde
  channelId?: string; // ID des Channels, zu dem die Nachricht gehört (wenn es eine Channel-Nachricht ist)
  parentMessageId?: string; // ID der Ursprungsnachricht, wenn diese Nachricht Teil eines Threads ist (optional)

  // directMessageId?: string; // ID der Direktnachrichten-Konversation (wenn es eine DM ist)
  // reactions?: Reaction[]; // Array der Reaktionen auf diese Nachricht (optional)
  // // Optional: Felder für @-Mentions oder #-Tags, falls diese speziell gespeichert werden sollen
  // mentionedUserIds?: string[]; // UIDs der erwähnten Benutzer
  // mentionedChannelId?: string; // ID des erwähnten Channels
}
