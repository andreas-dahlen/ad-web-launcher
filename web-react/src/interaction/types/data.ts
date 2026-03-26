import type { Vec2 } from "./primitives.ts"

export interface CarouselData {
  index: number
  size: Vec2
}

export interface CarouselModifiers {
  lockSwipeAt?: {
    prev: number | null
    next: number | null
  }
}

export interface DragData {
  position: Vec2
  constraints: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

export interface DragModifiers {
  snap?: Vec2; locked?: boolean
}

export interface SliderData {
  thumbSize: Vec2
  constraints: { min: number; max: number }
  size: Vec2
}

export type SwipeData =
  | (CarouselData & CarouselModifiers)
  | SliderData
  | (DragData & DragModifiers)

export interface GestureUpdate {
  //update goes where?
  //pointerId will not be transfared but used as key.. also slider is the only one right now... could be for... dragData..?
  pointerId: number
  sliderStartOffset?: number
  sliderValuePerPixel?: number
}


