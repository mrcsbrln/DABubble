import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-add-members',
  imports: [],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss',
})
export class AddMembersComponent {
  closeDialog = output<void>();
  channelName = input<string>();

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  isHovering = signal(false);
  isButtonDisabled = signal(true);

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
