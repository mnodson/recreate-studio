import { trigger, transition, style, query, group, animate } from '@angular/animations';

export const shutterAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    // Initial state - pages overlap
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),

    // Create shutter overlay elements
    query(':enter', [
      style({
        opacity: 0,
        zIndex: 1
      })
    ], { optional: true }),

    query(':leave', [
      style({
        opacity: 1,
        zIndex: 2
      })
    ], { optional: true }),

    group([
      // Fade out the leaving page behind the shutter
      query(':leave', [
        animate('400ms ease-in-out', style({
          opacity: 0
        }))
      ], { optional: true }),

      // Fade in the entering page after shutter opens
      query(':enter', [
        animate('400ms 200ms ease-in-out', style({
          opacity: 1
        }))
      ], { optional: true })
    ])
  ])
]);
