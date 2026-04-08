import type { GestureUpdate } from '@interaction/types/descriptor/dataType'
import type { Direction, EventType, Vec2 } from '@interaction/types/primitiveType'

export interface CancelData {
  element: HTMLElement
  pressCancel: boolean
}

export type CtxBase = {
  event: EventType
  readonly id: string
  readonly element: HTMLElement
  storeAccepted: boolean
}

export type CtxButton = CtxBase & {
  type: 'button'
}

export type CtxCarousel = CtxBase & {
  type: 'carousel'
  delta: Vec2
  cancel?: CancelData

  delta1D?: number
  direction?: Direction
}

export type CtxSlider = CtxBase & {
  type: 'slider'
  delta: Vec2
  cancel?: CancelData

  delta1D?: number
  gestureUpdate?: GestureUpdate
}

export type CtxDrag = CtxBase & {
  type: 'drag'
  delta: Vec2
  cancel?: CancelData
}

export type CtxType =
  | CtxCarousel
  | CtxSlider
  | CtxDrag
  | CtxButton

export type CtxSwipeType = Exclude<CtxType, CtxButton>

/* -------------------------
        Solvers
    -------------------------- */

export type CarouselCtxPartial = Partial<Pick<CtxCarousel, 'delta1D' | 'direction' | 'storeAccepted'>>
export type SliderCtxPartial = Partial<Pick<CtxSlider, 'delta1D' | 'gestureUpdate' | 'storeAccepted'>>
export type DragCtxPartial = Partial<Pick<CtxDrag, 'storeAccepted' | 'delta'>>

export interface Normalized1D {
  mainSize?: number | null
  crossSize?: number | null
  mainThumbSize?: number | null
  crossThumbSize?: number | null
  mainOffset?: number | null
  crossOffset?: number | null
  mainDelta?: number | null
  crossDelta?: number | null
}

/* -------------------------
        Custom Event typing
    -------------------------- */
export type ReactionEvent = CustomEvent<CtxType>