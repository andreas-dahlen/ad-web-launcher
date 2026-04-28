import type { BaseInteraction, BaseWithSwipe } from "./baseType.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers } from "./dataType.ts"
import type { Capabilities } from "./baseType.ts"
import type { CtxButton, CtxCarousel, CtxDrag, CtxSlider } from './ctxType.ts'


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

export type Descriptor =
  | ({ type: 'carousel' } & CarouselDesc)
  | ({ type: 'slider' } & SliderDesc)
  | ({ type: 'drag' } & DragDesc)
  | ({ type: 'button' } & ButtonDesc)

export type SwipeableDescriptor = Exclude<Descriptor, { type: 'button' }>