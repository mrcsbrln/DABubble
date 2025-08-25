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

export const fadeInOut = trigger('fadeInOut', [
  state(
    'hidden',
    style({
      opacity: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
    })
  ),
  state(
    'visible',
    style({
      opacity: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
    })
  ),
  transition('hidden => visible', [animate('300ms ease-out')]),
  transition('visible => hidden', [animate('200ms ease-in')]),
]);

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
      })
    ),
    state(
      'visible',
      style({
        opacity: 1,
        transform: 'translateX(0) translateY(-50%)',
        display: 'flex',
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

export const slideLeft = trigger('slideLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('220ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('180ms ease-in', style({ transform: 'translateX(-100%)' })),
  ]),
]);

export const slideRight = trigger('slideRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('220ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('180ms ease-in', style({ transform: 'translateX(100%)' })),
  ]),
]);
