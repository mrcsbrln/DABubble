import { Injectable, inject, DestroyRef, signal } from '@angular/core';
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
export class ChannelService {
  private firestore = inject(Firestore);
  private channelMessageServive = inject(ChannelMessageService);
  private destroyRef = inject(DestroyRef);

  channels = signal<Channel[]>([]);

  unsubChannels!: Unsubscribe;

  constructor() {
    this.unsubChannels = this.subChannelsCollection();
    this.destroyRef.onDestroy(() => {
      this.unsubChannels();
    });
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
    return this.channels().find(
      (channel) => channel.id === this.channelMessageServive.currentChannelId()
    );
  }

  getChannelById(channelId: string) {
    return this.channels().find((channel) => channel.id === channelId);
  }

  getMembersOfChannel(channelId: string) {
    const channel = this.channels().find((channel) => channel.id === channelId);
    return channel?.memberIds;
  }

  async addChannel(channelData: channelData) {
    try {
      await addDoc(this.getChannelsCollectionRef(), channelData);
    } catch (error) {
      console.error(error);
    }
  }

  subChannelsCollection() {
    return onSnapshot(this.getChannelsCollectionRef(), (channelsSnapshot) => {
      const channels: Channel[] = [];
      channelsSnapshot.forEach((channelDoc) => {
        channels.push(this.setChannelObject(channelDoc.data(), channelDoc.id));
      });
      this.channels.set(channels);
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

  async updateChannelName(channelId: string, newName: string) {
    const channelDocRef = this.getChannelDocRef(channelId);
    try {
      await updateDoc(channelDocRef, { name: newName });
    } catch (error) {
      console.error(error);
    }
  }

  async updateChannelDescription(channelId: string, newDescription: string) {
    const channelDocRef = this.getChannelDocRef(channelId);
    try {
      await updateDoc(channelDocRef, { description: newDescription });
    } catch (error) {
      console.error(error);
    }
  }
}
