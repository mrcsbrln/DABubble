import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
  AfterViewInit,
  ElementRef,
  OnChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChannelMessageService } from '../../../../services/channel-message.service';
import { FilterService } from '../../../../services/filter.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-message-box',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss',
})
export class MessageBoxComponent implements OnInit, AfterViewInit, OnChanges {
  private destroyRef = inject(DestroyRef);
  private channelMessageService = inject(ChannelMessageService);
  private userService = inject(UserService);
  private filterService = inject(FilterService);

  protected textareaRef =
    viewChild.required<ElementRef<HTMLTextAreaElement>>('textareaRef');

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

  private focusTextarea() {
    this.textareaRef()?.nativeElement?.focus();
  }

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
    console.log(this.textareaRef().nativeElement);

    // this.route.paramMap
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(() => {
    //     this.focusTextarea();
    //   });

    this.destroyRef.onDestroy(() => this.form.reset());
  }

  ngAfterViewInit() {
    this.focusTextarea();
  }

  ngOnChanges() {
    this.focusTextarea();
  }

  addEmojiToInput(emoji: string) {
    const control = this.form.controls.content;
    const current = control.value ?? '';
    control.setValue(current + emoji);

    this.isEmojiPickerOpen.set(false);
    this.focusTextarea();
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

  getChannelsOfCurrentUser() {
    return this.filterService.getChannelsOfCurrentUser();
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
