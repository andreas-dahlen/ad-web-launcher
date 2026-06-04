

import type { ComputedPatch } from '@interaction/types/computed.types.ts'
import type { Direction, EventType, Vec2 } from '../../shared/typing/core.types.ts'

export interface CancelData {
  readonly element: HTMLElement
  pressCancel: boolean
}

export type Runtime = {
  event: EventType
  delta: Vec2
  cancel?: CancelData
  thresholdValue?: Vec2
}

export type CarouselSolution = | {
  storeAccepted: false
} | {
  storeAccepted: true
  delta1D: number
  direction?: Direction
  event?: 'swipeRevert'
}

export type SliderSolution = | {
  storeAccepted: false
} | {
  storeAccepted: true
  delta1D: number
  computedUpdate?: ComputedPatch
}

export type ScrollSolution = | {
  storeAccepted: false
} | {
  storeAccepted: true
  delta1D?: number
  overflowValue?: number
  isVisible?: boolean
  computedUpdate?: ComputedPatch
  event?: 'swipeRevert'
}

export type DragSolution = | {
  //   storeAccepted: false
  // } | {
  storeAccepted: true
  delta: Vec2
}

export interface Normalized1D {
  mainSize?: number
  crossSize?: number
  mainThumbSize?: number
  crossThumbSize?: number
  mainOffset?: number
  crossOffset?: number
  mainDelta?: number
  crossDelta?: number
}

export type sliderNormalized1D = normalize1DBase & {
  mainSize: number
  crossSize: number
  mainThumbSize: number
  crossThumbSize: number
}

export type carouselNormalized1D = normalize1DBase & {
  mainSize: number
  crossSize: number
}

export type normalize1DBase = {
  mainDelta: number
  crossDelta: number
  mainOffset: number
  crossOffset: number
}

/* -------------------------
        Custom Event typing
    -------------------------- */
// export type ReactionEvent = CustomEvent<CtxType>

export type ReactionEvent = CustomEvent<EventType>