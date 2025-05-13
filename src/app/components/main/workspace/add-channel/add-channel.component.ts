import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Channel } from '../../../../interfaces/channel.interface';
import { ChannelService } from '../../../../services/channel.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { AuthService } from '../../../../services/auth/auth.service';

type AddChannelData = Omit<Channel, 'id'>;

@Component({
  selector: 'app-add-channel',
  imports: [ReactiveFormsModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent {
  @Output() closeDialog = new EventEmitter<void>();

  private channelService = inject(ChannelService);
  private authService = inject(AuthService);

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
    const channelName = this.form.controls.channelName.value;
    const description = this.form.controls.description.value;
    const creatorId = this.authService.currentUser()?.uid;
    if (this.form.controls.channelName.valid && creatorId) {
      const channelToSend: AddChannelData = {
        name: channelName!,
        description: description || null,
        creatorId: creatorId!,
        memberIds: [creatorId],
        createdAt: serverTimestamp(),
      };
      this.channelService.addChannel(channelToSend);
      this.onCloseDialog();
    }
    this.form.reset();
  }
}
