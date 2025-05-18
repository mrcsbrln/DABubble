import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderComponent } from './header/header.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { RouterOutlet } from '@angular/router';

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
  authService = inject(AuthService);
  isWorkspaceHidden = signal(false);
  isThreadHidden = signal(false);

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
