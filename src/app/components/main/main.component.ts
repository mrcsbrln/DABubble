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

  ngOnInit() {
    this.updateViewport();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.width.set(window.innerWidth);
  }
  isWorkspaceHidden = signal(false);
  isChatHidden = signal(false);
  isThreadHidden = signal(true);

  isWorkspaceBtnHovered = signal(false);

  // get hiddenClasses() {
  //   return {
  //     'workspace-hidden': this.isWorkspaceHidden(),
  //     'thread-hidden': this.isThreadHidden(),
  //     'workspace-thread-hidden':
  //       this.isWorkspaceHidden() && this.isThreadHidden(),
  //   };
  // }

  onActivate(component: DirectMessageComponent | ChannelMessageComponent) {
    if ('openThread' in component && component.openThread?.subscribe) {
      component.openThread.subscribe(() => this.isThreadHidden.set(false));
    }
  }

  toggleWorkspaceVisibility(): void {
    this.isWorkspaceHidden.update((value) => !value);
  }

  toggleThreadVisibility(): void {
    this.isThreadHidden.update((value) => !value);
  }

  private updateViewport() {
    this.width.set(typeof window !== 'undefined' ? window.innerWidth : 0);
  }
}
