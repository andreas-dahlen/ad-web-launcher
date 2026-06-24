import type { FrameSnapshot } from './descriptor/base.types'
import type { ScrollComputed, SliderComputed } from './runtime/computed.types'
import type { CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from './descriptor/descriptor.types'
import type { Delta, Direction } from '@typing/core.types'
import type { RuntimePress, RuntimeSwipe, RuntimeCommit, RuntimeStart } from './runtime/runtime.types'

type Payload<T> = {
  payload: T
}

type Cache<T> = {
  computedUpdate: T
}

type Standard = {
  route: "default"
}

type Revert = {
  route: "revert"
}
/*
---------
CAROUSEL
---------
*/
export type CarouselSolver = {
  swipe(r: RuntimeSwipe, d: CarouselDesc):
    (Standard & CarouselSwipe) | null

  swipeCommit(r: RuntimeCommit, d: CarouselDesc):
    (Standard & CarouselCommit) | Revert
}
export type CarouselSwipe = Payload<{ delta1D: number }>
export type CarouselCommit = Payload<{ delta1D: number; direction: Direction }>

/*
---------
SLIDER
---------
*/
export type SliderSolver = {
  press(r: RuntimePress, d: SliderDesc):
    Standard & SliderPress

  swipeStart(r: RuntimeStart, d: SliderDesc):
    (Standard & SliderStart & Cache<SliderComputed>)

  swipe(r: RuntimeSwipe, d: SliderDesc, c: SliderComputed):
    (Standard & SliderSwipe) | null
  swipeCommit(r: RuntimeCommit, d: SliderDesc, c: SliderComputed):
    (Standard & SliderCommit) | null
}
export type SliderPress = Payload<{ delta1D: number }>
export type SliderStart = Payload<{ delta1D: number }>
export type SliderSwipe = Payload<{ delta1D: number }>
export type SliderCommit = Payload<{ delta1D: number }>

/*
---------
DRAG
---------
*/
export type DragSolver = {
  swipeStart(r: RuntimeStart, d: DragDesc):
    Standard & DragStart
  swipe(r: RuntimeSwipe, d: DragDesc):
    Standard & DragSwipe
  swipeCommit(r: RuntimeCommit, d: DragDesc):
    Standard & DragCommit
}
export type DragStart = Payload<{ frameRect: FrameSnapshot }>
export type DragSwipe = Payload<Delta>
export type DragCommit = Payload<Delta>
/*
---------
SCROLL
---------
*/
export type ScrollSolver = {
  swipeStart(r: RuntimeStart, d: ScrollDesc):
    (Standard & Cache<ScrollComputed> & ScrollStart) |
    (Standard & Cache<ScrollComputed> & ScrollOverflowStart)

  swipe(r: RuntimeSwipe, d: ScrollDesc, c: ScrollComputed):
    Standard &
    (ScrollSwipe | ScrollOverflowSwipe)

  swipeCommit(r: RuntimeCommit, d: ScrollDesc, c: ScrollComputed):
    (Standard &
      (ScrollCommit | ScrollOverflowCommit))
    |
    (Revert &
      ScrollOverflowRevert)
}

export type ScrollStart = Payload<{
  delta1D: number
  isOverflow: false
}>

export type ScrollOverflowStart = Payload<{
  isOverflow: true
}>
export type ScrollSwipe = Payload<{
  delta1D: number
  isOverflow: false
}>

export type ScrollOverflowSwipe = Payload<{
  overflowValue: number
  isOverflow: true
}>
export type ScrollCommit = Payload<{
  isVisible: true
  delta1D: number
  isOverflow: false
}>

export type ScrollOverflowCommit = Payload<{
  isVisible: boolean
  overflowValue: number
  isOverflow: true
}>
export type ScrollOverflowRevert = Payload<{
  isVisible: boolean
  overflowValue: number
}>

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