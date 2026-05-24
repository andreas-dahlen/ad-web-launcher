import type { Size2D, Vec2 } from "../core/primitiveType.ts"

export interface CarouselData {
  readonly index: number
  readonly sceneSize: Size2D
}

export interface CarouselModifiers {
  readonly lockSwipeAt?: {
    readonly prev: number | null
    readonly next: number | null
  }
}

export interface DragData {
  readonly settledOffset: Vec2
  readonly layout: DragLayout
}

export interface DragLayout {
  readonly deviceSize: Size2D
  readonly containerSize: Size2D
  readonly itemSize: Size2D
  readonly constraints: DragConstraints
}

export interface DragConstraints {
  readonly minX: number
  readonly maxX: number
  readonly minY: number
  readonly maxY: number
}

export interface DragModifiers {
  readonly snap?: Vec2;
  readonly locked?: boolean
}

export interface SliderData {
  readonly thumbSize: Size2D
  readonly constraints: SliderConstraints
  readonly containerSize: Size2D
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