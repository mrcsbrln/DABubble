import { Component, output } from '@angular/core';

@Component({
  selector: 'app-thread',
  imports: [],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  closeThread = output<void>();

  onCloseThread() {
    this.closeThread.emit();
  }
}
