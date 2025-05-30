import {
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  signal,
  OnDestroy,
} from '@angular/core';
import { Unsubscribe } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from '@angular/fire/firestore';
import { DirectMessage } from '../interfaces/direct-message.interface';

type DirectMessageData = Omit<DirectMessage, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class DirectMessageService implements OnDestroy {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  directMessages: DirectMessage[] = [];
  messagesByChannelId: DirectMessage[] = [];

  currentChannelId = signal('');
  selectedUserId = signal('');

  unsubMessages!: Unsubscribe;
  unsubMessagesByChannelId!: Unsubscribe;

  constructor() {
    this.unsubMessages = this.subMessageCollection();
  }

  ngOnDestroy() {
    if (this.unsubMessages) {
      this.unsubMessages();
    }
    if (this.unsubMessagesByChannelId) {
      this.unsubMessagesByChannelId();
    }
  }

  directMessagesCollectionRef() {
    return collection(this.firestore, 'direct-messages');
  }

  async addMessage(directMessageData: DirectMessageData) {
    try {
      await addDoc(this.directMessagesCollectionRef(), directMessageData);
    } catch (error) {
      console.error(error);
    }
  }

  subMessageCollection() {
    return runInInjectionContext(this.injector, () => {
      return onSnapshot(this.directMessagesCollectionRef(), (messages) => {
        this.directMessages = [];
        messages.forEach((message) => {
          this.directMessages.push(
            this.setMessageObject(message.data(), message.id)
          );
        });
      });
    });
  }

  setMessageObject(obj: Partial<DirectMessage>, id: string): DirectMessage {
    return {
      id: id,
      participantIds: obj.participantIds || ['', ''],
      content: obj.content || '',
      timestamp: obj.timestamp || serverTimestamp(),
      parentMessageId: obj.parentMessageId,
    };
  }
}
