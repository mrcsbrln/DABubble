import { Component, inject, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Channel } from '../../../interfaces/channel.interface';
import { ChannelService } from '../../../services/channel.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth/auth.service';
import { AutofocusDirective } from '../../directives/autofocus.directive';

type AddChannelData = Omit<Channel, 'id'>;

@Component({
  selector: 'app-add-channel',
  imports: [ReactiveFormsModule, AutofocusDirective],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent {
  closeDialog = output<void>();

  private channelService = inject(ChannelService);
  private authService = inject(AuthService);

  isCloseBtnHovered = signal(false);

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

  channelAlreadyExists() {
    const channelName = this.form.controls.channelName.value;
    return this.channelService
      .channels()
      .some((channel) => channel.name === channelName);
  }

  onSubmit() {
    const channelName = this.form.controls.channelName.value;
    const description = this.form.controls.description.value;
    const creatorId = this.authService.currentUser()?.uid;
    if (
      this.form.controls.channelName.valid &&
      creatorId &&
      !this.channelAlreadyExists()
    ) {
      const channelToSend: AddChannelData = {
        name: channelName!,
        description: description || '',
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
