import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderComponent } from './header/header.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [
    HeaderComponent,
    WorkspaceComponent,
    ChatComponent,
    ThreadComponent,
    CommonModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})

export class MainComponent {
  authService = inject(AuthService);
  isWorkspaceHidden: boolean = false;
  isThreadHidden: boolean = false;

  toggleWorkspaceVisibility(): void {
    this.isWorkspaceHidden = !this.isWorkspaceHidden;
  }

  toggleThreadVisibility(): void {
    this.isThreadHidden = !this.isThreadHidden;
  }

}
