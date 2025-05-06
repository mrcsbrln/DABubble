import { Injectable, OnDestroy, effect, inject, signal } from '@angular/core';
import { Message } from '../interfaces/message.interface';
import {
  addDoc,
  collection,
  Firestore,
  onSnapshot,
  query,
  serverTimestamp,
  Unsubscribe,
  where,
} from '@angular/fire/firestore';

type MessageData = Omit<Message, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class MessageService implements OnDestroy {
  firestore = inject(Firestore);

  messages: Message[] = [];
  messagesByChannelId: Message[] = [];

  currentChannelId = signal('W2A17eoejK29BIlWgY7z'); //will become dynamic at a later stage

  unsubMessages!: Unsubscribe;
  unsubMessagesByChannelId!: Unsubscribe;

  constructor() {
    this.unsubMessages = this.subMessageCollection();
    effect(() => {
      this.unsubMessagesByChannelId = this.subMessagesByChannelId(
        this.currentChannelId()
      );
    });
  }

  messagesCollectionRef() {
    return collection(this.firestore, 'messages');
  }

  async addMessage(messageData: MessageData) {
    try {
      await addDoc(this.messagesCollectionRef(), messageData);
    } catch (error) {
      console.error(error);
    }
  }

  subMessageCollection() {
    return onSnapshot(this.messagesCollectionRef(), (messages) => {
      this.messages = [];
      messages.forEach((message) => {
        this.messages.push(this.setMessageObject(message.data(), message.id));
      });
    });
  }

  setMessageObject(obj: Partial<Message>, id: string): Message {
    return {
      id: id,
      senderId: obj.senderId || '',
      content: obj.content || '',
      timestamp: obj.timestamp || serverTimestamp(),
      channelId: obj.channelId,
    };
  }

  subMessagesByChannelId(channelId: string) {
    const q = query(
      this.messagesCollectionRef(),
      where('channelId', '==', channelId)
    );
    return onSnapshot(q, (messages) => {
      this.messagesByChannelId = [];
      messages.forEach((message) => {
        this.messagesByChannelId.push(
          this.setMessageObject(message.data(), message.id)
        );
      });
    });
  }

  ngOnDestroy() {
    this.unsubMessages();
  }
}
