import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-message-box',
  imports: [ReactiveFormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss',
})
export class MessageBoxComponent implements OnInit {
  destroyRef = inject(DestroyRef);

  placeholder = input<string>();

  send = output<string>();
  contentControlReady = output<FormControl<string>>();

  isEmojiPickerOpen = signal(false);

  emojis: string[] = [
    '😀',
    '😂',
    '😢',
    '🤓',
    '😱',
    '👍',
    '👌',
    '👋',
    '🎉',
    '🚀',
    '🙏',
    '✅',
  ];

  readonly form = new FormGroup({
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
  });

  ngOnInit(): void {
    this.contentControlReady.emit(this.form.controls.content);
    this.destroyRef.onDestroy(() => {
      this.form.reset();
    });
  }

  addEmojiToInput(emoji: string) {
    const current = this.form.controls.content.value || '';
    this.form.controls.content.setValue(current + emoji);
    this.isEmojiPickerOpen.set(false);
  }

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.isEmojiPickerOpen.update((open) => !open);
  }

  onSubmit() {
    const text = this.form.value.content?.trim();
    if (!text) return;
    this.send.emit(text);
    this.form.reset();
  }
}
