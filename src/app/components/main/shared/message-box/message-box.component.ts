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
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-message-box',
  imports: [ReactiveFormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss',
})
export class MessageBoxComponent implements OnInit, AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

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
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.focusTextarea(true));
  }

  ngOnInit(): void {
    this.contentControlReady.emit(this.form.controls.content);
    this.destroyRef.onDestroy(() => {
      this.form.reset();
    });
  }

  addEmojiToInput(emoji: string) {
    const control = this.form.controls.content;
    const current = control.value ?? '';
    control.setValue(current + emoji);

    this.isEmojiPickerOpen.set(false);
    this.focusTextarea(true); // Caret ans Ende setzen
  }

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.isEmojiPickerOpen.update((open) => !open);
  }

  onSubmit() {
    const text = this.form.value.content;
    if (!text) return;
    this.send.emit(text);
    this.form.reset();
    this.focusTextarea();
  }

  private focusTextarea(moveCaretToEnd = false) {
    // kurz warten, bis das Value-Update im DOM ist
    setTimeout(() => {
      const el = this.textareaRef.nativeElement;
      el.focus();
      if (moveCaretToEnd) {
        const len = el.value.length;
        try {
          el.setSelectionRange(len, len);
        } catch {
          // iOS-Fallback, falls nötig
          el.selectionStart = el.selectionEnd = len;
        }
      }
    });
  }
}
