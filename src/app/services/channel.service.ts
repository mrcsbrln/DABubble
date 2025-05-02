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

  unsubChannels!: Unsubscribe;

  constructor() {
    this.unsubChannels = this.subChannelCollection();
  }

  channelsCollectionRef() {
    return collection(this.firestore, 'channels');
  }

  async addMessage(channelData: Channel) {
    try {
      await addDoc(this.channelsCollectionRef(), channelData);
    } catch (error) {
      console.error(error);
    }
  }

  subChannelCollection() {
    return onSnapshot(this.channelsCollectionRef(), (channels) => {
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
    this.unsubChannels();
  }
}
