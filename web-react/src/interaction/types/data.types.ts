import type { OnEdgeDir, Vec2 } from "../../shared/typing/core.types.ts"

export type CarouselData = CarouselDataBase & CarouselModifiers

interface CarouselDataBase {
  readonly index: number
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
}

export interface SliderData {
  readonly constraints: SliderConstraints

}

export interface SliderConstraints {
  readonly min: number
  readonly max: number
}

export interface ScrollData {
  readonly settledValue: number
  readonly isVisible: boolean //always included but not always used... onEdgeDir drives behavior.
  readonly onEdgeDir?: OnEdgeDir
}