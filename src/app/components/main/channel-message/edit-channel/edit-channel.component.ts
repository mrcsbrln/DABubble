import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-channel',
  imports: [ FormsModule ],
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

  inputValue = '';
  ngOnInit() {
  this.inputValue = '# ' + this.channelName();
}



}
