import { Component, input, output, signal, effect } from '@angular/core';
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

  isHovering = signal(false);

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  onCloseDialog() {
    this.closeDialogEditChannel.emit();
  }

  inputValue = signal('');

  constructor() {
    effect(() => {
        this.inputValue.set('# ' + (this.channelName() ?? ''));
    });
  }

  onInput(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.inputValue.set(newValue);
  }

  isInputReadonly = signal(true);
  confirmChannelNameEdit() {
    this.isInputReadonly.update((currentValue) => !currentValue);
  }

}
