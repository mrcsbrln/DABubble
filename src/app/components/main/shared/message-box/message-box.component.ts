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
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ChannelService } from '../../../../services/channel.service';
import { ChannelMessageService } from '../../../../services/channel-message.service';
import { FilterService } from '../../../../services/filter.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-message-box',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss',
})
export class MessageBoxComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private channelMessageService = inject(ChannelMessageService);
  private channelService = inject(ChannelService);
  private userService = inject(UserService);
  private filterService = inject(FilterService);

  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  placeholder = input<string>();
  isChannelMessage = input<boolean>();
  isDirectMessage = input<boolean>();
  isNewMessage = input<boolean>();

  send = output<string>();
  contentControlReady = output<FormControl<string>>();

  isEmojiPickerOpen = signal(false);
  isAtInInput = signal(false);
  isHashInInput = signal(false);

  isEmojiBtnHovered = signal(false);
  isAtBtnHovered = signal(false);
  isSendBtnHovered = signal(false);

  channelIdFromRoute = signal<string>('');

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

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pm) => {
        const id = pm.get('channelId') ?? '';
        this.channelIdFromRoute.set(id);
        this.focusTextarea(true);
      });

    this.destroyRef.onDestroy(() => this.form.reset());
    if (this.isNewMessage()) {
      console.log(this.getAllUsers());
    }
  }

  addEmojiToInput(emoji: string) {
    const control = this.form.controls.content;
    const current = control.value ?? '';
    control.setValue(current + emoji);

    this.isEmojiPickerOpen.set(false);
    this.focusTextarea(true);
  }

  checkForAtOrHash() {
    const searchBarValue = this.form.controls.content.value || '';
    this.isAtInInput.set(
      searchBarValue?.includes('@') && searchBarValue.length === 1
    );
    this.isHashInInput.set(
      searchBarValue?.includes('#') && searchBarValue.length === 1
    );
  }

  private focusTextarea(moveCaretToEnd = false) {
    setTimeout(() => {
      const el = this.textareaRef.nativeElement;
      el.focus();
      if (moveCaretToEnd) {
        const len = el.value.length;
        try {
          el.setSelectionRange(len, len);
        } catch {
          el.selectionStart = el.selectionEnd = len;
        }
      }
    });
  }

  getChannels() {
    return this.channelService.channels();
  }

  getAllUsers() {
    return this.userService.users();
  }

  getChannelMembers() {
    return this.filterService
      .getChannelById(this.channelIdFromRoute())
      ?.memberIds.map((id) => this.filterService.getUserById(id));
  }

  onSubmit() {
    const text = this.form.value.content;
    if (!text) return;
    this.send.emit(text);
    this.form.reset();
    this.focusTextarea();
  }

  resetCurrentChannelId() {
    this.channelMessageService.currentChannelId.set('');
  }

  resetForm() {
    this.form.controls.content.reset();
    this.checkForAtOrHash();
  }

  toggleAtInInput() {
    const c = this.form.controls.content;
    c.setValue(c.value === '@' ? '' : '@');
    this.checkForAtOrHash();
  }

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.isEmojiPickerOpen.update((open) => !open);
  }
}
