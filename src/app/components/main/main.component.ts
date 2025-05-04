import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderComponent } from './header/header.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [HeaderComponent, WorkspaceComponent, ThreadComponent, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  authService = inject(AuthService);
  isWorkspaceHidden = false;
  isThreadHidden = false;

  toggleWorkspaceVisibility(): void {
    this.isWorkspaceHidden = !this.isWorkspaceHidden;
  }

  toggleThreadVisibility(): void {
    this.isThreadHidden = !this.isThreadHidden;
  }
}
