

import type { ComputedPatch } from '@interaction/types/computed.types.ts'
import type { Direction, EventType, Vec2 } from '../../shared/typing/core.types.ts'
import type { FrameSnapshot } from '@interaction/types/base.types.ts'

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

//TODO 
// 
//use event mapping instead and inside return specific solutions.. 
// type DragSolutionMap = { swipeStart: DragSwipeStartSolution swipe: DragSwipeSolution swipeCommit: DragSwipeCommitSolution } 
// Record<EventType, DragSolutionMap[EventType]>
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

export type DragSolution = {
  storeAccepted: true
  frameRect?: FrameSnapshot
  delta: Vec2
}

export interface Normalized1D {
  mainSize?: number
  crossSize?: number
  mainitemSize?: number
  crossitemSize?: number
  mainOffset?: number
  crossOffset?: number
  mainDelta?: number
  crossDelta?: number
}

export type sliderNormalized1D = normalize1DBase & {
  mainSize: number
  crossSize: number
  mainitemSize: number
  crossitemSize: number
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