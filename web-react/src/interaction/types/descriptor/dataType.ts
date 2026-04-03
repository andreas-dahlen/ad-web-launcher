import type { Vec2 } from "../primitiveType.ts"

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

export interface GestureUpdate {
  //Updates stay as its own part of descriptor and is never merged into other parts. Currently only used for slider
  pointerId: number
  sliderStartOffset?: number
  sliderValuePerPixel?: number
}


