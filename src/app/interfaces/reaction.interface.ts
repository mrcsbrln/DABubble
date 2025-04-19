export interface Reaction {
  emoji: string;
  userIds: string[]; // Array der UIDs der Benutzer, die mit diesem Emoji reagiert haben (Referenz zu UserProfile.uid)
  count: number; // Anzahl der Reaktionen mit diesem Emoji (redundant zu userIds.length, aber nützlich)
}
