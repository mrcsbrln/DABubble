import { Component, output, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../services/channel.service';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { AutofocusDirective } from '../../../directives/autofocus.directive';

@Component({
  selector: 'app-edit-channel',
  imports: [FormsModule, AutofocusDirective],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent {
  private channelService = inject(ChannelService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  router = inject(Router);

  closeDialogEditChannel = output<void>();

  channelName = signal(this.getChannelName());
  creatorName = signal(this.getCreatorName());
  isHovering = signal(false);
  inputNameValue = signal('');
  inputDescriptionValue = signal('');
  isInputNameReadonly = signal(true);
  isInputDescriptionReadonly = signal(true);

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  constructor() {
    effect(() => {
      this.inputNameValue.set(this.getChannelName() ?? '');
      this.inputDescriptionValue.set(this.getChannelDescription() ?? '');
    });
  }

  onCloseDialog() {
    this.closeDialogEditChannel.emit();
  }

  onInputName(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.inputNameValue.set(newValue);
  }

  onInputDescription(event: Event) {
    const newValue = (event.target as HTMLTextAreaElement).value;
    this.inputDescriptionValue.set(newValue);
  }

  confirmChannelNameEdit() {
    this.isInputNameReadonly.update((currentValue) => !currentValue);
  }

  onSaveChannelName() {
    this.setChannelName(this.inputNameValue());
    this.channelName.set(this.inputNameValue());
    this.confirmChannelNameEdit();
  }

  confirmChannelDescriptionEdit() {
    this.isInputDescriptionReadonly.update((currentValue) => !currentValue);
  }

  onSaveChannelDescription() {
    this.setChannelDescription(this.inputDescriptionValue());
    this.confirmChannelDescriptionEdit();
  }

  getChannelName() {
    return this.channelService.getCurrentChannel()?.name;
  }

  getChannelDescription() {
    return this.channelService.getCurrentChannel()?.description ?? undefined;
  }

  getCreatorName() {
    const creatorId = this.channelService.getCurrentChannel()?.creatorId;
    return creatorId
      ? this.getUserBySenderId(creatorId)?.displayName
      : undefined;
  }

  setChannelName(newName: string) {
    const channelId = this.channelService.getCurrentChannel()?.id;
    if (channelId) {
      this.channelService.updateChannelName(channelId, newName);
    }
  }

  setChannelDescription(newDescription: string) {
    const channelId = this.channelService.getCurrentChannel()?.id;
    if (channelId) {
      this.channelService.updateChannelDescription(channelId, newDescription);
    }
  }

  getUserBySenderId(senderId: string) {
    return this.userService.users().find((user) => user.uid === senderId);
  }

  leaveChannel() {
    const channelId = this.channelService.getCurrentChannel()?.id;
    const currentUserId = this.authService.currentUser()?.uid;
    if (!channelId || !currentUserId) return;
    this.channelService.deleteUserFromChannel(channelId, currentUserId);
    this.router.navigateByUrl('/');
  }
}
