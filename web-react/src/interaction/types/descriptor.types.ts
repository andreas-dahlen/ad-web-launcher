import type { BaseInteraction, BaseWithSwipe } from "./base.types.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers, ScrollData } from "./data.types.ts"
import type { Capabilities } from "./base.types.ts"
import type { CtxButton, CtxCarousel, CtxDrag, CtxScroll, CtxSlider } from './ctx.types.ts'
import type { Axis1D, Axis2D } from '@typing/core.types.ts'

export type CarouselDesc = {
  readonly type: 'carousel'
  readonly base: BaseWithSwipe & { axis: Axis1D }
  readonly data: CarouselData & CarouselModifiers
  readonly capabilities: Capabilities
  ctx: CtxCarousel
}

export type SliderDesc = {
  readonly type: 'slider'
  readonly base: BaseWithSwipe & { axis: Axis1D }
  readonly data: SliderData
  readonly capabilities: Capabilities
  ctx: CtxSlider
}

export type DragDesc = {
  readonly type: 'drag'
  readonly base: BaseWithSwipe & { axis: Axis2D }
  readonly data: DragData & DragModifiers
  readonly capabilities: Capabilities
  ctx: CtxDrag
}

export type ButtonDesc = {
  readonly type: 'button'
  readonly base: BaseInteraction
  readonly capabilities: Capabilities
  ctx: CtxButton
}

export type ScrollDesc = {
  readonly type: 'scroll'
  readonly base: BaseWithSwipe & { axis: Axis1D }
  readonly data: ScrollData
  readonly capabilities: Capabilities
  ctx: CtxScroll
}

export type Descriptor =
  | CarouselDesc
  | SliderDesc
  | DragDesc
  | ButtonDesc
  | ScrollDesc

// export type CarouselCtxTypes =
//   | ({ event: 'press' } & CarouselCtxPress)
//   | ({ event: 'swipe' } & CarouselCtxSwipe)
//   | ({ event: 'swipeStart' } & CarouselCtxSwipeStart)
//   | ({ event: 'swipeCommit' } & CarouselCtxSwipeCommit)
//   | ({ event: 'swipeRevert' } & CarouselCtxSwipeRevert)

export type SwipeableDescriptor = Exclude<Descriptor, { type: 'button' }>