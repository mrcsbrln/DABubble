import {
  animate,
  animation,
  AnimationReferenceMetadata,
  style,
} from '@angular/animations';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SiteAnimationsService {}

export const slideInRight: AnimationReferenceMetadata = animation(
  [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate(
      '{{ duration }} {{ easing }}',
      style({ transform: 'translateX(0)', opacity: 1 })
    ),
  ],
  {
    params: { duration: '400ms', easing: 'ease-out' },
  }
);

export const slideOutRight = animation(
  [
    animate(
      '{{ duration }} {{ easing }}',
      style({ transform: 'translateX(100%)', opacity: 0 })
    ),
  ],
  {
    params: { duration: '300ms', easing: 'ease-in' },
  }
);
