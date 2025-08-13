import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { RouterOutlet } from '@angular/router';
import { DirectMessageComponent } from './direct-message/direct-message.component';
import { ChannelMessageComponent } from './channel-message/channel-message.component';

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
export class MainComponent {
  isWorkspaceHidden = signal(false);
  isThreadHidden = signal(true);

  isWorkspaceBtnHovered = signal(false);

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
}
