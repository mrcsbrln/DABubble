import {
  animate,
  animation,
  AnimationReferenceMetadata,
  state,
  style,
  transition,
  trigger,
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

export const reactionBarSlideCurrentUser = trigger(
  'reactionBarSlideCurrentUser',
  [
    state(
      'hidden',
      style({
        opacity: 0,
        transform: 'translateX(48px) translateY(-50%)',
        display: 'none',
        left: 32,
      })
    ),
    state(
      'visible',
      style({
        opacity: 1,
        transform: 'translateX(0) translateY(-50%)',
        display: 'flex',
        left: 32,
      })
    ),
    transition('hidden => visible', [
      style({ display: 'flex' }),
      animate('300ms ease-out'),
    ]),
    transition('visible => hidden', [
      animate(
        '200ms ease-in',
        style({ opacity: 0, transform: 'translateX(48px) translateY(-50%)' })
      ),
    ]),
  ]
);

export const reactionBarSlideOtherUser = trigger('reactionBarSlideOtherUser', [
  state(
    'hidden',
    style({
      opacity: 0,
      transform: 'translateX(-48px) translateY(-50%)',
      display: 'none',
      right: 32,
    })
  ),
  state(
    'visible',
    style({
      opacity: 1,
      transform: 'translateX(0) translateY(-50%)',
      display: 'flex',
      right: 32,
    })
  ),
  transition('hidden => visible', [
    style({ display: 'flex' }),
    animate('300ms ease-out'),
  ]),
  transition('visible => hidden', [
    animate(
      '200ms ease-in',
      style({ opacity: 0, transform: 'translateX(-48px) translateY(-50%)' })
    ),
  ]),
]);
