import { Component, input, output, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-channel',
  imports: [FormsModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent {
  closeDialogEditChannel = output<void>();
  channelName = input<string>();
  channelDescription = input<string>();

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
      this.inputNameValue.set('# ' + (this.channelName() ?? ''));
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
  @ViewChild('channelNameInput') channelNameInputRef!: ElementRef<HTMLInputElement>;
  confirmChannelNameEdit() {
    this.isInputNameReadonly.update((currentValue) => !currentValue);
    if (!this.isInputNameReadonly() && this.channelNameInputRef) {
      setTimeout(() => this.channelNameInputRef.nativeElement.focus(), 0);
    }
  }

  isInputDescriptionReadonly = signal(true);
  @ViewChild('channelDescriptionTextarea') channelDescriptionTextareaRef!: ElementRef<HTMLTextAreaElement>;
  confirmChannelDescriptionEdit() {
    this.isInputDescriptionReadonly.update((currentValue) => !currentValue);
    if (!this.isInputDescriptionReadonly() && this.channelDescriptionTextareaRef) {
      setTimeout(() => this.channelDescriptionTextareaRef.nativeElement.focus(), 0);
    }
  }
}
