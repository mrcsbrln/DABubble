import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { RouterOutlet } from '@angular/router';
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

  onActivate(component: DirectMessageComponent) {
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

  get gridClasses() {
    return {
      'workspace-hidden': this.isWorkspaceHidden(),
      'thread-hidden': this.isThreadHidden(),
    };
  }
}
