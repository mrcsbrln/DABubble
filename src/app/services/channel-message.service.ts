import {
  Injectable,
  OnDestroy,
  effect,
  inject,
  signal,
  Injector,
  runInInjectionContext,
} from '@angular/core';
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
export class ChannelMessageService implements OnDestroy {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  messages: Message[] = [];
  messagesByChannelId: Message[] = [];

  currentChannelId = signal('');

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
    return runInInjectionContext(this.injector, () => {
      return onSnapshot(this.messagesCollectionRef(), (messages) => {
        this.messages = [];
        messages.forEach((message) => {
          this.messages.push(this.setMessageObject(message.data(), message.id));
        });
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
}
