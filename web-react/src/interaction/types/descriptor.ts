import type { BaseInteraction, BaseWithSwipe, CancelData } from "./base.ts"
import type { CarouselData, CarouselModifiers, SliderData, DragData, DragModifiers } from "./data.ts"
import type { CarouselSolutions, SliderSolutions, DragSolutions } from "./solutions.ts"
import type { Reactions } from "./base.ts"
import type { DataKeys, InteractionType } from '@interaction/types/primitives.ts'

export type CarouselDescriptor = {
  type: 'carousel'
  base: BaseWithSwipe
  data: CarouselData & CarouselModifiers
  solutions: CarouselSolutions
  reactions: Reactions
  cancel?: CancelData
}

export type SliderDescriptor = {
  type: 'slider'
  base: BaseWithSwipe
  data: SliderData
  solutions: SliderSolutions
  reactions: Reactions
  cancel?: CancelData
}

export type DragDescriptor = {
  type: 'drag'
  base: BaseWithSwipe
  data: DragData & DragModifiers
  solutions: DragSolutions
  reactions: Reactions
  cancel?: CancelData
}

export type ButtonDescriptor = {
  type: 'button'
  base: BaseInteraction
  reactions: Reactions
}

export type SwipeDescriptor = Exclude<Descriptor, ButtonDescriptor>

export type Descriptor =
  | CarouselDescriptor
  | SliderDescriptor
  | DragDescriptor
  | ButtonDescriptor

export function isGestureType(type: InteractionType | null): type is DataKeys {
  return type === "carousel" ||
    type === "slider" ||
    type === "drag"
}