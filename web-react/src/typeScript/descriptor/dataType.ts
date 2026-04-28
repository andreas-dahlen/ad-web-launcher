import type { Vec2 } from "../core/primitiveType.ts"

export interface CarouselData {
  readonly index: number
  readonly size: Vec2
}

export interface CarouselModifiers {
  readonly lockSwipeAt?: {
    readonly prev: number | null
    readonly next: number | null
  }
}

export interface DragData {
  readonly position: Vec2
  readonly layout: DragLayout
}

export interface DragLayout {
  readonly constraints: DragConstraints
  readonly container: Vec2
  readonly item: Vec2
}

export interface DragConstraints {
  readonly minX: number
  readonly maxX: number
  readonly minY: number
  readonly maxY: number
}

export interface DragModifiers {
  readonly snap?: Vec2; readonly locked?: boolean
}

export interface SliderData {
  readonly thumbSize: Vec2
  readonly constraints: SliderConstraints
  readonly size: Vec2
}

export interface SliderConstraints {
  readonly min: number
  readonly max: number
}

export interface GestureUpdate {
  //Updates stay as its own part of descriptor and is never merged into other parts. Currently only used for slider
  readonly pointerId: number
  readonly sliderStartOffset?: number
  readonly sliderValuePerPixel?: number
}