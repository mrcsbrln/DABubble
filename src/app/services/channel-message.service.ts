import {
  Injectable,
  OnDestroy,
  effect,
  inject,
  signal,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { ChannelMessage } from '../interfaces/channel-message.interface';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  where,
} from '@angular/fire/firestore';

type MessageData = Omit<ChannelMessage, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class ChannelMessageService implements OnDestroy {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  messages: ChannelMessage[] = [];
  messagesByChannelId: ChannelMessage[] = [];

  currentChannelId = signal('');

  parentChannelMessageId = signal('');

  unsubMessages!: Unsubscribe;
  unsubMessagesByChannelId!: Unsubscribe;

  constructor() {
    this.unsubMessages = this.subMessageCollection();
    effect(() => {
      if (this.unsubMessagesByChannelId) this.unsubMessagesByChannelId();
      this.unsubMessagesByChannelId = this.subMessagesByChannelId(
        this.currentChannelId()
      );
    });
  }

  ngOnDestroy() {
    if (this.unsubMessages) {
      this.unsubMessages();
    }
    if (this.unsubMessagesByChannelId) {
      this.unsubMessagesByChannelId();
    }
  }

  messagesCollectionRef() {
    return collection(this.firestore, 'channel-messages');
  }

  async addMessage(messageData: MessageData) {
    try {
      await addDoc(this.messagesCollectionRef(), messageData);
    } catch (error) {
      console.error(error);
    }
  }

  subMessageCollection() {
    return runInInjectionContext(this.injector, () => {
      return onSnapshot(this.messagesCollectionRef(), (messages) => {
        this.messages = [];
        messages.forEach((message) => {
          this.messages.push(this.setMessageObject(message.data(), message.id));
        });
      });
    });
  }

  setMessageObject(obj: Partial<ChannelMessage>, id: string): ChannelMessage {
    return {
      id: id,
      senderId: obj.senderId || '',
      content: obj.content || '',
      timestamp: obj.timestamp || serverTimestamp(),
      channelId: obj.channelId,
      parentMessageId: obj.parentMessageId,
    };
  }

  subMessagesByChannelId(channelId: string) {
    const q = query(
      this.messagesCollectionRef(),
      where('channelId', '==', channelId)
    );
    return runInInjectionContext(this.injector, () => {
      return onSnapshot(q, (messages) => {
        this.messagesByChannelId = [];
        messages.forEach((message) => {
          this.messagesByChannelId.push(
            this.setMessageObject(message.data(), message.id)
          );
        });
      });
    });
  }

  async updateMessage(messageId: string, newContent: string) {
    const messageDocRef = doc(this.firestore, 'channel-messages', messageId);
    try {
      await updateDoc(messageDocRef, { content: newContent });
    } catch (error) {
      console.error('Error updating message:', messageId, error);
    }
  }
}
