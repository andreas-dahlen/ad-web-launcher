import type { BaseInteraction, BaseWithSwipe } from "./base.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers } from "./data.ts"
// import type { CarouselSolutions, SliderSolutions, DragSolutions } from "./solutions.ts"
import type { Reactions } from "./base.ts"

export type CarouselMeta = {
  base: BaseWithSwipe
  data: CarouselData & CarouselModifiers
  // solutions: CarouselSolutions
  reactions: Reactions
  // cancel?: CancelData
}

export type SliderMeta = {
  base: BaseWithSwipe
  data: SliderData
  // solutions: SliderSolutions
  reactions: Reactions
  // cancel?: CancelData
}

export type DragMeta = {
  base: BaseWithSwipe
  data: DragData & DragModifiers
  // solutions: DragSolutions
  reactions: Reactions
  // cancel?: CancelData
}

export type ButtonMeta = {
  base: BaseInteraction
  reactions: Reactions
}

export type MetaType =
  | CarouselMeta
  | SliderMeta
  | DragMeta
  | ButtonMeta