import type { BaseInteraction, BaseWithSwipe } from "./baseType.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers } from "./dataType.ts"
import type { Reactions } from "./baseType.ts"
import type { CtxButton, CtxCarousel, CtxDrag, CtxSlider } from '@interaction/types/ctxType.ts'


export type CarouselDesc = {
  base: BaseWithSwipe
  data: CarouselData & CarouselModifiers
  reactions: Reactions
  ctx: CtxCarousel
}

export type SliderDesc = {
  base: BaseWithSwipe
  data: SliderData
  reactions: Reactions
  ctx: CtxSlider
}

export type DragDesc = {
  base: BaseWithSwipe
  data: DragData & DragModifiers
  reactions: Reactions
  ctx: CtxDrag
}

export type ButtonDesc = {
  base: BaseInteraction
  reactions: Reactions
  ctx: CtxButton
}

export type Descriptor =
  | ({ type: 'carousel' } & CarouselDesc)
  | ({ type: 'slider' } & SliderDesc)
  | ({ type: 'drag' } & DragDesc)
  | ({ type: 'button' } & ButtonDesc)
