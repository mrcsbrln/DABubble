import {
  Component,
  computed,
  HostListener,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { RouterOutlet } from '@angular/router';
import { DirectMessageComponent } from './direct-message/direct-message.component';
import { ChannelMessageComponent } from './channel-message/channel-message.component';

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
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
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
  isChatHidden = signal(true);
  isThreadHidden = signal(true);

  ngOnInit() {
    this.updateViewport();
    if (this.breakpoint() === 'sm' || this.breakpoint() === 'xs') {
      this.isWorkspaceHidden.set(false);
      this.isChatHidden.set(true);
      this.isThreadHidden.set(true);
    }
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

  toggleWorkspaceVisibility(): void {
    if (this.breakpoint() === 'sm') {
      this.isWorkspaceHidden.update((value) => !value);
      this.isChatHidden.set(false);
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
