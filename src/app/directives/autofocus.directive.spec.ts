import { ElementRef } from '@angular/core';
import { AutofocusDirective } from './autofocus.directive';

describe('AutofocusDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = {
      nativeElement: document.createElement('input'),
    } as ElementRef<HTMLInputElement>;
    const directive = new AutofocusDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});
