import { Injectable, inject, OnDestroy } from '@angular/core';
import { Channel } from '../interfaces/channel.interface';
import {
  addDoc,
  collection,
  Firestore,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChannelService implements OnDestroy {
  firestore = inject(Firestore);

  channels: Channel[] = [];

  unsubMessages!: Unsubscribe;

  constructor() {
    this.unsubMessages = this.subChannelCollection();
  }

  messagesCollectionRef() {
    return collection(this.firestore, 'messages');
  }

  async addMessage(channelData: Channel) {
    try {
      await addDoc(this.messagesCollectionRef(), channelData);
    } catch (error) {
      console.error(error);
    }
  }

  subChannelCollection() {
    return onSnapshot(this.messagesCollectionRef(), (channels) => {
      this.channels = [];
      channels.forEach((channel) => {
        this.channels.push(this.setChannelObject(channel.data(), channel.id));
      });
    });
  }

  setChannelObject(obj: Partial<Channel>, id: string): Channel {
    return {
      id: id,
      name: obj.name || '',
      description: obj.description || '',
      creatorId: obj.creatorId || '',
      memberIds: obj.memberIds || [],
      createdAt: obj.createdAt || serverTimestamp(),
    };
  }

  ngOnDestroy() {
    this.unsubMessages();
  }
}
