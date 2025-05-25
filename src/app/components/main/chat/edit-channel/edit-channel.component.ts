import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-edit-channel',
  imports: [],
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
}
