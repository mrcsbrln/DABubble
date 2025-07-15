import { Component } from '@angular/core';
import { MessageBoxComponent } from '../shared/message-box/message-box.component';

@Component({
  selector: 'app-new-message',
  imports: [MessageBoxComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {}
