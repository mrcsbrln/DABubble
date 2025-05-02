import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-channel',
  imports: [],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent {
  @Output() closeDialog = new EventEmitter<void>();

  onCloseDialog() {
    this.closeDialog.emit();
  }
}
