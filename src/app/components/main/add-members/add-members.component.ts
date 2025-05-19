import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-add-members',
  imports: [],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss',
})
export class AddMembersComponent {
  closeDialog = output<void>();

  closeIconSrc = 'img/close.svg';
  closeIconHoverSrc = 'img/close-hover.svg';

  isHovering = signal(false);

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
