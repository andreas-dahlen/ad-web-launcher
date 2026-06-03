import type { OnEdgeDir, Size2D, Vec2 } from "../../shared/typing/core.types.ts"

export type CarouselData = CarouselDataBase & CarouselModifiers

interface CarouselDataBase {
  readonly index: number
  readonly sceneSize: Size2D
}

export interface CarouselModifiers {
  readonly lockSwipeAt?: {
    readonly prev: number | null
    readonly next: number | null
  }
}

export type DragData = DragDataBase & DragModifiers

interface DragDataBase {
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

export interface ScrollData {
  readonly settledValue: number
  readonly containerSize: Size2D
  readonly contentSize: Size2D
  readonly isVisible: boolean //always included but not always used... onEdgeDir drives behavior.
  readonly onEdgeDir?: OnEdgeDir
}