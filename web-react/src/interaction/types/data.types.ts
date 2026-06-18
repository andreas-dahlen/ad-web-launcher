import type { Constraints1D, Constraints2D, OnEdgeDir, Vec2 } from "../../shared/typing/core.types.ts"

export type CarouselData = CarouselDataBase & CarouselModifiers

interface CarouselDataBase {
  readonly currentScene: number
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

  readonly constraints: Constraints2D
}


export interface DragModifiers {
  readonly snap?: Vec2;
}

export interface SliderData {
  readonly constraints: Constraints1D

}


export interface ScrollData {
  readonly settledValue: number
  readonly isVisible: boolean //always included but not always used... onEdgeDir drives behavior.
  readonly onEdgeDir?: OnEdgeDir
}