import { FieldValue } from '@angular/fire/firestore';
import { Message } from '../interfaces/channel-message.interface';
import { Reaction } from '../interfaces/reaction.interface';

export class ChatMessage implements Message {
  id = '';
  senderId: string;
  content: string;
  timestamp: FieldValue;
  channelId?: string | undefined;
  directMessageId?: string | undefined;
  reactions?: Reaction[] | undefined;
  parentMessageId?: string | undefined;
  mentionedUserIds?: string[] | undefined;
  mentionedChannelId?: string | undefined;

  constructor(
    id: string,
    senderId: string,
    content: string,
    timestamp: FieldValue
  ) {
    this.id = id;
    this.senderId = senderId;
    this.content = content;
    this.timestamp = timestamp;
  }
}
