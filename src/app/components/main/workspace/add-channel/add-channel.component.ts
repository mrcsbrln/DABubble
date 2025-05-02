import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import { Channel } from '../../../../interfaces/channel.interface';
import { ChannelService } from '../../../../services/channel.service';

// type ChannelEditData = Pick<Channel, 'name' | 'description'>;

@Component({
  selector: 'app-add-channel',
  imports: [ReactiveFormsModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent {
  @Output() closeDialog = new EventEmitter<void>();

  channelService = inject(ChannelService);

  form = new FormGroup({
    channelName: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    description: new FormControl('', Validators.minLength(1)),
  });

  onCloseDialog() {
    this.closeDialog.emit();
  }

  onSubmit() {
    if (this.form.controls.channelName.valid) {
      console.log(
        this.form.controls.channelName.value,
        this.form.controls.description.value
      );
      this.form.reset();
    }

    // if (this.form.controls.content.valid && messageText && senderId) {
    //   const messageDataToSend: MessageData = {
    //     senderId: senderId,
    //     content: messageText,
    //     timestamp: serverTimestamp(),
    //   };
    //   this.messageService.addMessage(messageDataToSend);
    //   this.form.controls.content.reset();
    // } else if (!senderId) {
    //   console.error('Benutzter nicht gefunden!');
    // }
  }
}
