import type { ComputedPackage } from '@interaction/types/runtime/computed.types.ts';
import type { CarouselCommit, CarouselSwipe, SliderPress, SliderSwipe, SliderCommit, SliderStart, DragStart, DragSwipe, DragCommit, ScrollStart, ScrollSwipe, ScrollCommit, ScrollOverflowStart, ScrollOverflowSwipe, ScrollOverflowCommit, ScrollOverflowRevert } from '@interaction/types/solver.types.ts';
import type { Press, Swipe, SwipeCommit, SwipeRevert, SwipeStart } from '@shared/types/core.types.ts';

// type WithComputed<T> = T & {
//   computedUpdate: ComputedPackage
// }

export type RouterPackage<A> = {
  action: A
  effects?: {
    computedUpdate?: ComputedPackage
    eventOverride?: "swipeRevert"
  }
}
/* -----------
  CAROUSEL
-------------- */
export type CarouselAction =
  | CarouselActionStart
  | CarouselActionSwipe
  | CarouselActionCommit
  | CarouselActionRevert

type CarouselActionStart = SwipeStart
type CarouselActionSwipe = Swipe & CarouselSwipe
type CarouselActionCommit = SwipeCommit & CarouselCommit
type CarouselActionRevert = SwipeRevert

/* -----------
  SLIDER
-------------- */
export type SliderAction =
  | SliderActionPress
  | SliderActionStart
  | SliderActionSwipe
  | SliderActionCommit

type SliderActionPress = Press & SliderPress
type SliderActionStart = SwipeStart & SliderStart
type SliderActionSwipe = Swipe & SliderSwipe
type SliderActionCommit = SwipeCommit & SliderCommit


/* -----------
  DRAG
------------- */

export type DragAction =
  | DragActionStart
  | DragActionSwipe
  | DragActionCommit

type DragActionStart = SwipeStart & DragStart
type DragActionSwipe = Swipe & DragSwipe
type DragActionCommit = SwipeCommit & DragCommit

/* -----------
  SCROLL
-------------- */

export type ScrollAction =
  | SwipeStart & (ScrollStart | ScrollOverflowStart)
  | Swipe & (ScrollSwipe | ScrollOverflowSwipe)
  | SwipeCommit & (ScrollCommit | ScrollOverflowCommit)
  | SwipeRevert & ScrollOverflowRevert