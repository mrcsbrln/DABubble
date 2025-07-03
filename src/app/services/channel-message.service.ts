import {
  Injectable,
  effect,
  inject,
  signal,
  Injector,
  runInInjectionContext,
  computed,
  DestroyRef,
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
export class ChannelMessageService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  messages = signal<ChannelMessage[]>([]);
  messagesByChannelId = signal<ChannelMessage[]>([]);

  currentChannelId = signal('');

  parentChannelMessageId = signal('');

  parentMessage = computed(() => {
    const id = this.parentChannelMessageId();
    return this.messagesByChannelId().find((message) => message.id === id);
  });

  threadMessages = computed(() => {
    const parentId = this.parentChannelMessageId();
    return this.messagesByChannelId().filter(
      (message) => message.parentMessageId === parentId
    );
  });

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
    this.destroyRef.onDestroy(() => {
      this.unsubMessages?.();
    });
    this.destroyRef.onDestroy(() => {
      this.unsubMessagesByChannelId?.();
    });
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
    return runInInjectionContext(this.injector, () =>
      onSnapshot(this.messagesCollectionRef(), (snapshot) => {
        this.messages.set(
          snapshot.docs.map((doc) => this.setMessageObject(doc.data(), doc.id))
        );
      })
    );
  }

  setMessageObject(obj: Partial<ChannelMessage>, id: string): ChannelMessage {
    return {
      id: id,
      senderId: obj.senderId || '',
      content: obj.content || '',
      timestamp: obj.timestamp || serverTimestamp(),
      channelId: obj.channelId,
      parentMessageId: obj.parentMessageId || null,
    };
  }

  subMessagesByChannelId(channelId: string) {
    const q = query(
      this.messagesCollectionRef(),
      where('channelId', '==', channelId)
    );
    return runInInjectionContext(this.injector, () => {
      return onSnapshot(q, (snap) => {
        const newMessages = snap.docs.map((doc) =>
          this.setMessageObject(doc.data(), doc.id)
        );
        this.messagesByChannelId.set(newMessages);
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
