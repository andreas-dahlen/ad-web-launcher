import type { FrameSnapshot } from '@interaction/types/base.types'
import type { ComputedPackage, ScrollComputed, SliderComputed } from '@interaction/types/computed.types'
import type { CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types'
import type { Direction, Vec2 } from '@typing/core.types'
import type { RuntimePress, RuntimeSwipe, RuntimeSwipeCommit, RuntimeSwipeStart } from '@interaction/types/runtime.types'
type StoreEffect<T> =
  {
    routing: 'store'
    solv: T
  }

type RevertEffect =
  {
    routing: 'replace-event'
    event: "swipeRevert"
  }
/*
---------
CAROUSEL
---------
*/
export type CarouselSolver = {
  swipe(r: RuntimeSwipe, d: CarouselDesc): StoreEffect<CarouselSwipePayload> | null
  swipeCommit(r: RuntimeSwipeCommit, d: CarouselDesc): StoreEffect<CarouselSwipeCommitPayload> | RevertEffect
}

export type CarouselSwipePayload = {
  delta1D: number
}
export type CarouselSwipeCommitPayload = {
  delta1D: number
  direction: Direction
}
/*
---------
SLIDER
---------
*/
export type SliderSolver = {
  press(r: RuntimePress, d: SliderDesc): StoreEffect<SliderPressPayload>
  swipeStart(r: RuntimeSwipeStart, d: SliderDesc): StoreEffect<SliderSwipeStartPayload>

  swipe(r: RuntimeSwipe, d: SliderDesc, c: SliderComputed): StoreEffect<SliderSwipePayload> | null
  swipeCommit(r: RuntimeSwipeCommit, d: SliderDesc, c: SliderComputed): StoreEffect<SliderSwipeCommitPayload> | null
}
export type SliderPressPayload = {
  delta1D: number
}
export type SliderSwipeStartPayload = {
  delta1D: number
  computedUpdate: ComputedPackage
}
export type SliderSwipePayload = {
  delta1D: number
}
export type SliderSwipeCommitPayload = {
  delta1D: number
}
/*
---------
DRAG
---------
*/
export type DragSolver = {
  swipeStart(r: RuntimeSwipeStart, d: DragDesc): StoreEffect<DragSwipeStartPayload>
  swipe(r: RuntimeSwipe, d: DragDesc): StoreEffect<DragSwipePayload>
  swipeCommit(r: RuntimeSwipeCommit, d: DragDesc): StoreEffect<DragSwipeCommitPayload>
}
export type DragSwipeStartPayload = {
  frameRect: FrameSnapshot
}
export type DragSwipePayload = {
  delta: Vec2
}
export type DragSwipeCommitPayload = {
  delta: Vec2
}
/*
---------
Scroll
---------
*/
export type ScrollSolver = {
  swipeStart(r: RuntimeSwipeStart, d: ScrollDesc): StoreEffect<ScrollSwipeStartPayload | ScrollOverflowSwipeStartPayload>

  swipe(r: RuntimeSwipe, d: ScrollDesc, c: ScrollComputed): StoreEffect<ScrollSwipePayload | ScrollOverflowSwipePayload>

  swipeCommit(r: RuntimeSwipeCommit, d: ScrollDesc, c: ScrollComputed): StoreEffect<ScrollSwipeCommitPayload | ScrollOverflowSwipeCommitPayload> | (RevertEffect & { solv: ScrollOverflowSwipeRevertPayload })
}

export type ScrollSwipeStartPayload = {
  computedUpdate: ComputedPackage
  delta1D: number
  isOverflow: false
}
export type ScrollOverflowSwipeStartPayload = {
  computedUpdate: ComputedPackage
  isOverflow: true
}
export type ScrollSwipePayload = {
  delta1D: number
  isOverflow: false
}

export type ScrollOverflowSwipePayload = {
  overflowValue: number
  isOverflow: true
}
export type ScrollSwipeCommitPayload = {
  isVisible: true
  delta1D: number
  isOverflow: false
}

export type ScrollOverflowSwipeCommitPayload = {
  isVisible: boolean
  overflowValue: number
  isOverflow: true
}
export type ScrollOverflowSwipeRevertPayload = {
  isVisible: boolean
  overflowValue: number
}
/*
---------------
NORMALIZATION
---------------
*/
export type normalize1DBase = {
  mainDelta: number
  crossDelta: number
  mainOffset: number
  crossOffset: number
}

export type Normalized1D = normalize1DBase & {
  mainSize: number
  crossSize: number
  mainitemSize: number
  crossitemSize: number
}

export type carouselNormalized1D = normalize1DBase & {
  mainSize: number
  crossSize: number
}




