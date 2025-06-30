import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { RouterOutlet } from '@angular/router';
import { ChannelMessageComponent } from './channel-message/channel-message.component';
import { DirectMessageComponent } from './direct-message/direct-message.component';

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    HeaderComponent,
    WorkspaceComponent,
    ThreadComponent,
    RouterOutlet,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  isWorkspaceHidden = signal(false);
  isThreadHidden = signal(true);

  toggleWorkspaceVisibility(): void {
    this.isWorkspaceHidden.update((value) => !value);
  }

  toggleThreadVisibility(): void {
    this.isThreadHidden.update((value) => !value);
  }

  onActivate(component: ChannelMessageComponent | DirectMessageComponent) {
    if (component instanceof ChannelMessageComponent) {
      component.openThread.subscribe(() => this.isThreadHidden.set(false));
    } else if (component instanceof DirectMessageComponent) {
      component.openThread.subscribe(() => this.isThreadHidden.set(false));
    } else return;
  }

  get gridClasses() {
    return {
      'workspace-hidden': this.isWorkspaceHidden(),
      'thread-hidden': this.isThreadHidden(),
    };
  }
}
