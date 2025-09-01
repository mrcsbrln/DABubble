import {
  Component,
  computed,
  HostListener,
  signal,
  OnInit,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { RouterOutlet } from '@angular/router';
import { DirectMessageComponent } from './direct-message/direct-message.component';
import { ChannelMessageComponent } from './channel-message/channel-message.component';
import {
  slideThread,
  slideWorkspace,
} from '../../services/site-animations.service';
import { DirectMessageService } from '../../services/direct-message.service';
import { ChannelMessageService } from '../../services/channel-message.service';
import { AddChannelComponent } from './add-channel/add-channel.component';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    WorkspaceComponent,
    ThreadComponent,
    RouterOutlet,
    ProfileMenuComponent,
    SearchBarComponent,
    AddChannelComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  animations: [slideThread, slideWorkspace],
})
export class MainComponent implements OnInit {
  private directMessageService = inject(DirectMessageService);
  private channelMessageService = inject(ChannelMessageService);
  width = signal(0);

  breakpoint = computed<Breakpoint>(() => {
    const w = this.width();
    if (w >= 1400) return 'xxl';
    if (w >= 1200) return 'xl';
    if (w >= 992) return 'lg';
    if (w >= 768) return 'md';
    if (w >= 576) return 'sm';
    return 'xs';
  });

  isWorkspaceHidden = signal(false);
  isChatHidden = signal(false);
  isThreadHidden = signal(true);

  isAddChannelDialogOpen = signal(false);

  private hideThreadOnLgEffect = effect(
    () => {
      const bp = this.breakpoint();
      if (bp === 'lg') {
        this.isThreadHidden.set(true);
      }
    },
    { allowSignalWrites: true }
  );

  ngOnInit() {
    this.directMessageService.selectedUserId.set('');
    this.channelMessageService.currentChannelId.set('');
    this.updateViewport();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.width.set(window.innerWidth);
  }

  isWorkspaceBtnHovered = signal(false);

  onActivate(component: DirectMessageComponent | ChannelMessageComponent) {
    if ('openThread' in component && component.openThread?.subscribe) {
      component.openThread.subscribe(() => this.isThreadHidden.set(false));
    }
  }

  handleOpenAddChannel() {
    this.isAddChannelDialogOpen.set(true);
  }

  handleCloseAddChannel() {
    this.isAddChannelDialogOpen.set(false);
  }

  toggleWorkspaceVisibility(): void {
    if (this.breakpoint() === 'sm' || this.breakpoint() === 'xs') {
      this.isWorkspaceHidden.update((value) => !value);
      this.isChatHidden.update((value) => !value);
      this.isThreadHidden.set(true);
    } else {
      this.isWorkspaceHidden.update((value) => !value);
    }
  }

  toggleThreadVisibility(): void {
    this.isThreadHidden.update((value) => !value);
  }

  private updateViewport() {
    this.width.set(typeof window !== 'undefined' ? window.innerWidth : 0);
  }
}
