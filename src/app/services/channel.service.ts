import { Injectable, inject, OnDestroy } from '@angular/core';
import { Channel } from '../interfaces/channel.interface';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from '@angular/fire/firestore';

type channelData = Omit<Channel, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class ChannelService implements OnDestroy {
  firestore = inject(Firestore);

  channels: Channel[] = [];

  unsubChannels!: Unsubscribe;

  constructor() {
    this.unsubChannels = this.subChannelsCollection();
  }

  getChannelDocRef() {
    return doc(this.getChannelsCollectionRef());
  }

  getChannelsCollectionRef() {
    return collection(this.firestore, 'channels');
  }

  // getChannelSubCollectionMessagesRef() {
  //   return collection(this.getChannelDocRef(), 'messages');
  // }

  async addChannel(channelData: channelData) {
    try {
      await addDoc(this.getChannelsCollectionRef(), channelData);
    } catch (error) {
      console.error(error);
    }
  }

  subChannelsCollection() {
    return onSnapshot(this.getChannelsCollectionRef(), (channels) => {
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
