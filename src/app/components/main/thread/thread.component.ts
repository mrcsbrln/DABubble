import { Component, ElementRef, HostListener, output, signal, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-thread',
  imports: [ReactiveFormsModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  @ViewChild('emojiPickerThread') emojiPickerRef!: ElementRef;
  @ViewChild('emojiToggleBtnThread') emojiToggleBtnRef!: ElementRef;

  closeThread = output<void>();

  isEmojiPickerOpen = signal(false);

  form = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

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

  onCloseThread() {
    this.closeThread.emit();
  }

  onSubmit() {
    console.log();
    // TODO
  }

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.isEmojiPickerOpen.update((open) => !open);
  }

  addEmojiToInput(emoji: string) {
    const current = this.form.controls.content.value || '';
    this.form.controls.content.setValue(current + emoji);
    this.isEmojiPickerOpen.set(false);
  }

  getChannelName() {
    // TODO:
    return '';
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const picker = this.emojiPickerRef?.nativeElement;
    const btn = this.emojiToggleBtnRef?.nativeElement;
    if (
      this.isEmojiPickerOpen() &&
      picker &&
      !picker.contains(event.target) &&
      btn &&
      !btn.contains(event.target)
    ) {
      this.isEmojiPickerOpen.set(false);
    }
  }

  @HostListener('blur', ['$event.target'])
  onBlur(target: HTMLElement) {
    if (target === this.emojiToggleBtnRef.nativeElement) {
      this.emojiToggleBtnRef.nativeElement.querySelector('img').src =
        '/img/add-reaction.svg';
    }
  }
}
