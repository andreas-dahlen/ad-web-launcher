import type { Constraints1D, Constraints2D, BoxSide, Vec2 } from '@shared/types/core.types.ts'

export type CarouselData = CarouselDatabase & CarouselModifiers

interface CarouselDatabase {
  readonly currentScene: number
}

interface CarouselModifiers {
  readonly lockSwipeAt?: {
    readonly prev: number | null
    readonly next: number | null
  }
}

export type DragData = DragDatabase & DragModifiers

interface DragDatabase {
  readonly settledOffset: Vec2

  readonly constraints: Constraints2D
}


interface DragModifiers {
  readonly snap?: Vec2;
}

export interface SliderData {
  readonly constraints: Constraints1D

}


export interface ScrollData {
  readonly settledValue: number
  readonly isVisible: boolean //always included but not always used... overflowSide drives behavior.
  readonly overflowSide?: BoxSide
}