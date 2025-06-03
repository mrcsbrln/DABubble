import {
  Component,
  input,
  output,
  signal,
  effect,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../services/channel.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-edit-channel',
  imports: [FormsModule ],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent {
  private channelService = inject(ChannelService);
  private userService = inject(UserService);

  closeDialogEditChannel = output<void>();

  channelName = input<string>();
  channelDescription = input<string>();
  creatorName = input<string>();
  updateChannelName = output<string>();
  updateChannelDescription = output<string>();

  isHovering = signal(false);

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  onCloseDialog() {
    this.closeDialogEditChannel.emit();
  }

  inputNameValue = signal('');
  inputDescriptionValue = signal('');

  constructor() {
    effect(() => {
      this.inputNameValue.set(this.channelName() ?? '');
    });
    effect(() => {
      this.inputDescriptionValue.set(this.channelDescription() ?? '');
    });
  }

  onInput(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.inputNameValue.set(newValue);
  }

  onInputDescription(event: Event) {
    const newValue = (event.target as HTMLTextAreaElement).value;
    this.inputDescriptionValue.set(newValue);
  }

  isInputNameReadonly = signal(true);
  @ViewChild('channelNameInput')
  channelNameInputRef!: ElementRef<HTMLInputElement>;
  confirmChannelNameEdit() {
    this.isInputNameReadonly.update((currentValue) => !currentValue);
    if (!this.isInputNameReadonly() && this.channelNameInputRef) {
      const input = this.channelNameInputRef.nativeElement;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      input.style.cursor = 'text';
    } else if (this.channelNameInputRef) {
      this.channelNameInputRef.nativeElement.style.cursor = '';
    }
  }

  onSaveChannelName() {
    this.updateChannelName.emit(this.inputNameValue());
    this.confirmChannelNameEdit();
  }

  onSaveChannelDescription() {
    this.updateChannelDescription.emit(this.inputDescriptionValue());
    this.confirmChannelDescriptionEdit();
  }

  isInputDescriptionReadonly = signal(true);
  @ViewChild('channelDescriptionTextarea')
  channelDescriptionTextareaRef!: ElementRef<HTMLTextAreaElement>;
  confirmChannelDescriptionEdit() {
    this.isInputDescriptionReadonly.update((currentValue) => !currentValue);
    if (
      !this.isInputDescriptionReadonly() &&
      this.channelDescriptionTextareaRef
    ) {
      const textarea = this.channelDescriptionTextareaRef.nativeElement;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      textarea.style.cursor = 'text';
    } else if (this.channelDescriptionTextareaRef) {
      this.channelDescriptionTextareaRef.nativeElement.style.cursor = '';
    }
  }

  // TODO added for childcomponent
    getChannelDescription() {
      return this.channelService.getCurrentChannel()?.description ?? undefined;
    }
    // TODO added for childcomponent
    getCreatorName() {
      const creatorId = this.channelService.getCurrentChannel()?.creatorId;
      return creatorId
        ? this.getUserBySenderId(creatorId)?.displayName
        : undefined;
    }

    // TODO added for childcomponent
    setChannelName(newName: string) {
      const channelId = this.channelService.getCurrentChannel()?.id;
      if (channelId) {
        this.channelService.updateChannelName(channelId, newName);
      }
    }

    // TODO added for childcomponent
    setChannelDescription(newDescription: string) {
      const channelId = this.channelService.getCurrentChannel()?.id;
      if (channelId) {
        this.channelService.updateChannelDescription(channelId, newDescription);
      }
    }

    getUserBySenderId(senderId: string) {
    return this.userService.users.find((user) => user.uid === senderId);
  }
}
