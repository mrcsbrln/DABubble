import { Timestamp } from '@angular/fire/firestore';
export interface Message {
  id?: string; // Eindeutige ID der Nachricht (Firestore Document ID)
  username?: string;
  senderId?: string; // UID des Absenders (Referenz zu UserProfile.uid)
  content?: string; // Textinhalt der Nachricht
  avatarUrl?: string; // URL des Avatars des Absenders (optional, falls nicht im UserProfile gespeichert)
  timestamp?: Timestamp; // Zeitstempel, wann die Nachricht gesendet wurde
  channelId?: string; // ID des Channels, zu dem die Nachricht gehört (wenn es eine Channel-Nachricht ist)
  directMessageId?: string; // ID der Direktnachrichten-Konversation (wenn es eine DM ist)
  reactions?: {
    type: string;      // z.B. 'check', 'like', ...
    iconUrl: string;      // z.B. 'img/chat/check-mark.svg'
    count: number;     // Anzahl der Reaktionen dieses Typs
  }[];
  parentMessageId?: string; // ID der Ursprungsnachricht, wenn diese Nachricht Teil eines Threads ist (optional)
  // Optional: Felder für @-Mentions oder #-Tags, falls diese speziell gespeichert werden sollen
  mentionedUserIds?: string[]; // UIDs der erwähnten Benutzer
  mentionedChannelId?: string; // ID des erwähnten Channels
}
