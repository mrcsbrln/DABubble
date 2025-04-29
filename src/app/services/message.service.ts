import { Injectable, inject } from '@angular/core';
import { Message } from '../interfaces/message.interface';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

type MessageData = Omit<Message, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  firestore = inject(Firestore);

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
}
