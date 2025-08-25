import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  ViewChild,
  AfterViewInit,
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
export class MessageBoxComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);

  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  placeholder = input<string>();

  send = output<string>();
  contentControlReady = output<FormControl<string>>();

  isEmojiPickerOpen = signal(false);

  isEmojiBtnHovered = signal(false);
  isAtBtnHovered = signal(false);
  isSendBtnHovered = signal(false);

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

  ngAfterViewInit(): void {
    setTimeout(() => this.textareaRef.nativeElement.focus());
  }

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
    this.focusTextarea();
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
    this.focusTextarea();
  }

  private focusTextarea() {
    setTimeout(() => this.textareaRef.nativeElement.focus());
  }
}
