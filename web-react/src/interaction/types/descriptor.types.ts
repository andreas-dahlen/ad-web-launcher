import type { BaseInteraction, BaseWithAxis1D, BaseWithAxis2D } from "./base.types.ts"
import type { CarouselData, SliderData, DragData, ScrollData } from "./data.types.ts"
import type { Capabilities } from "./base.types.ts"

export type CarouselDesc = {
  readonly type: 'carousel'
  readonly base: BaseWithAxis1D
  readonly data: CarouselData
  readonly capabilities: Capabilities
}

export type SliderDesc = {
  readonly type: 'slider'
  readonly base: BaseWithAxis1D
  readonly data: SliderData
  readonly capabilities: Capabilities
}

export type DragDesc = {
  readonly type: 'drag'
  readonly base: BaseWithAxis2D
  readonly data: DragData
  readonly capabilities: Capabilities
}

export type ButtonDesc = {
  readonly type: 'button'
  readonly base: BaseInteraction
  readonly capabilities: Capabilities
}

export type ScrollDesc = {
  readonly type: 'scroll'
  readonly base: BaseWithAxis1D
  readonly data: ScrollData
  readonly capabilities: Capabilities
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