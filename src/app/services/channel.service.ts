import { Injectable, inject, OnDestroy } from '@angular/core';
import { Channel } from '../interfaces/channel.interface';
import { MessageService } from './message.service';
import { UserService } from './user.service';
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
  private messageServive = inject(MessageService);
  private userService = inject(UserService);

  channels: Channel[] = [];

  unsubChannels!: Unsubscribe;

  constructor() {
    this.unsubChannels = this.subChannelsCollection();
  }

  ngOnDestroy() {
    this.unsubChannels();
  }

  async addUserToChannel(userId: string) {
    const channelDocRef = this.getChannelDocRef();
    try {
      await updateDoc(channelDocRef, {
        memberIds: arrayUnion(userId),
      });
    } catch (error) {
      console.error(error);
    }
  }

  getChannelDocRef() {
    return doc(this.getChannelsCollectionRef());
  }

  getChannelsCollectionRef() {
    return collection(this.firestore, 'channels');
  }

  getChannelById() {
    return this.channels.find(
      (channel) => channel.id === this.messageServive.currentChannelId()
    );
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
