import { Directive, AfterViewInit, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
})
export class AutofocusDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}
