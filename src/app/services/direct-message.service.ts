import {
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  signal,
  DestroyRef,
} from '@angular/core';
import { Unsubscribe } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from '@angular/fire/firestore';
import { DirectMessage } from '../interfaces/direct-message.interface';
import { AuthService } from './auth/auth.service';
import { UserService } from './user.service';

type DirectMessageData = Omit<DirectMessage, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class DirectMessageService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  directMessages = signal<DirectMessage[]>([]);
  messagesByChannelId = signal<DirectMessage[]>([]);

  selectedUserId = signal('');

  parentDirectMessageId = signal('');

  unsubMessages!: Unsubscribe;
  unsubMessagesByChannelId!: Unsubscribe;

  constructor() {
    this.unsubMessages = this.subMessageCollection();
    this.destroyRef.onDestroy(() => {
      if (this.unsubMessages) this.unsubMessages();
    });
    this.destroyRef.onDestroy(() => {
      if (this.unsubMessagesByChannelId) this.unsubMessagesByChannelId();
    });
  }

  async addMessage(directMessageData: DirectMessageData) {
    try {
      await addDoc(this.directMessagesCollectionRef(), directMessageData);
    } catch (error) {
      console.error(error);
    }
  }

  addReactionToMessage(emoji: string, messageId: string) {
    const currentUser = this.authService.currentUser();
    const message = this.directMessages().find((dm) => dm.id === messageId);

    if (!message || !currentUser) {
      return;
    }

    const reactionIndex = message.reactions.findIndex(
      (reaction) => reaction.emoji === emoji
    );

    if (reactionIndex > -1) {
      const reaction = message.reactions[reactionIndex];

      if (!reaction.userIds.includes(currentUser.uid)) {
        reaction.userIds.push(currentUser.uid);
      } else {
        reaction.userIds = reaction.userIds.filter(
          (uid) => uid !== currentUser.uid
        );

        if (reaction.userIds.length === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      }
    } else {
      message.reactions.push({ emoji: emoji, userIds: [currentUser.uid] });
    }

    this.updateReactions(message);
  }

  directMessagesCollectionRef() {
    return collection(this.firestore, 'direct-messages');
  }

  getDirectMessagesOfCurrentUser() {
    const currentUserId = this.authService.currentUser()?.uid;
    return this.directMessages().filter((message) =>
      message.participantIds.find((id) => id === currentUserId)
    );
  }

  getAllOtherParcipitantsIds() {
    const currentUserId = this.authService.currentUser()?.uid;
    const directMessages = this.getDirectMessagesOfCurrentUser();
    return directMessages.map((dm) =>
      dm.participantIds.find((id) => id !== currentUserId)
    );
  }

  getUserDataOfOtherParcipitants() {
    const otherParticipantIds = this.getAllOtherParcipitantsIds();
    return this.userService
      .users()
      .filter((user) => otherParticipantIds.includes(user.uid));
  }

  getDirectMessagesOfSelectedUser() {
    const currentUserId = this.authService.currentUser()?.uid;
    const selectedUserId = this.selectedUserId();

    if (!currentUserId || !selectedUserId) return [];
    if (currentUserId === selectedUserId) return [];

    return this.directMessages().filter(
      (dm) =>
        dm.participantIds.includes(currentUserId) &&
        dm.participantIds.includes(selectedUserId)
    );
  }

  subMessageCollection() {
    return runInInjectionContext(this.injector, () =>
      onSnapshot(this.directMessagesCollectionRef(), (snapshot) => {
        this.directMessages.set(
          snapshot.docs.map((doc) => this.setMessageObject(doc.data(), doc.id))
        );
      })
    );
  }

  setMessageObject(obj: Partial<DirectMessage>, id: string): DirectMessage {
    return {
      id: id,
      participantIds: obj.participantIds || ['', ''],
      content: obj.content || '',
      timestamp: obj.timestamp || serverTimestamp(),
      parentMessageId: obj.parentMessageId || null,
      reactions: obj.reactions || [],
    };
  }

  async updateReactions(message: DirectMessage) {
    const messageRef = doc(this.firestore, 'direct-messages', message.id);
    try {
      await updateDoc(messageRef, { reactions: message.reactions });
    } catch (error) {
      console.error(error);
    }
  }
}
