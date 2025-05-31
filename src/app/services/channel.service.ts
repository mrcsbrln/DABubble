import { Injectable, inject, OnDestroy } from '@angular/core';
import { Channel } from '../interfaces/channel.interface';
import { ChannelMessageService } from './channel-message.service';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  Firestore,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
} from '@angular/fire/firestore';

type channelData = Omit<Channel, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class ChannelService implements OnDestroy {
  private firestore = inject(Firestore);
  private channelMessageServive = inject(ChannelMessageService);

  channels: Channel[] = [];

  unsubChannels!: Unsubscribe;

  constructor() {
    this.unsubChannels = this.subChannelsCollection();
  }

  ngOnDestroy() {
    this.unsubChannels();
  }

  async addUserToChannel(userId: string, docId: string) {
    const channelDocRef = this.getChannelDocRef(docId);
    try {
      await updateDoc(channelDocRef, {
        memberIds: arrayUnion(userId),
      });
    } catch (error) {
      console.error(error);
    }
  }

  getChannelDocRef(docId: string) {
    return doc(this.getChannelsCollectionRef(), docId);
  }

  getChannelsCollectionRef() {
    return collection(this.firestore, 'channels');
  }

  getCurrentChannel() {
    return this.channels.find(
      (channel) => channel.id === this.channelMessageServive.currentChannelId()
    );
  }

  getChannelById(channelId: string) {
    return this.channels.find((channel) => channel.id === channelId);
  }

  getMembersOfChannel(channelId: string) {
    const channel = this.channels.find((channel) => channel.id === channelId);
    return channel?.memberIds;
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
}
