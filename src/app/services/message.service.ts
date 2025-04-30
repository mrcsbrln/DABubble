import { Injectable, OnDestroy, inject } from '@angular/core';
import { Message } from '../interfaces/message.interface';
import {
  addDoc,
  collection,
  Firestore,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from '@angular/fire/firestore';

type MessageData = Omit<Message, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class MessageService implements OnDestroy {
  constructor() {
    this.unsubMessages = this.subUserCollection();
  }

  firestore = inject(Firestore);

  messages: Message[] = [];

  unsubMessages!: Unsubscribe;

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

  subUserCollection() {
    return onSnapshot(this.messagesCollectionRef(), (messages) => {
      this.messages = [];
      messages.forEach((message) => {
        this.messages.push(this.setUserObject(message.data(), message.id));
      });
    });
  }

  setUserObject(obj: Partial<Message>, id: string): Message {
    return {
      id: id,
      senderId: obj.senderId || '',
      content: obj.content || '',
      timestamp: obj.timestamp || serverTimestamp(),
    };
  }

  ngOnDestroy() {
    this.unsubMessages();
  }
}
