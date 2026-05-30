import type { BaseInteraction, BaseWithSwipe } from "./base.types.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers, ScrollData } from "./data.types.ts"
import type { Capabilities } from "./base.types.ts"
import type { CtxButton, CtxCarousel, CtxDrag, CtxScroll, CtxSlider } from './ctx.types.ts'


export type CarouselDesc = {
  readonly base: BaseWithSwipe
  readonly data: CarouselData & CarouselModifiers
  readonly capabilities: Capabilities
  ctx: CtxCarousel
}

export type SliderDesc = {
  readonly base: BaseWithSwipe
  readonly data: SliderData
  readonly capabilities: Capabilities
  ctx: CtxSlider
}

export type DragDesc = {
  readonly base: BaseWithSwipe
  readonly data: DragData & DragModifiers
  readonly capabilities: Capabilities
  ctx: CtxDrag
}

export type ButtonDesc = {
  readonly base: BaseInteraction
  readonly capabilities: Capabilities
  ctx: CtxButton
}

export type ScrollDesc = {
  readonly base: BaseWithSwipe
  readonly data: ScrollData
  readonly capabilities: Capabilities
  ctx: CtxScroll
}

export type Descriptor =
  | ({ type: 'carousel' } & CarouselDesc)
  | ({ type: 'slider' } & SliderDesc)
  | ({ type: 'drag' } & DragDesc)
  | ({ type: 'button' } & ButtonDesc)
  | ({ type: 'scroll' } & ScrollDesc)

export type SwipeableDescriptor = Exclude<Descriptor, { type: 'button' }>