import type { EventType, Vec2 } from '../../shared/typing/core.types.ts'

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


export type normalize1DBase = {
  mainDelta: number
  crossDelta: number
  mainOffset: number
  crossOffset: number
}

export type Normalized1D = normalize1DBase & {
  mainSize: number
  crossSize: number
  mainitemSize: number
  crossitemSize: number
}

export type carouselNormalized1D = normalize1DBase & {
  mainSize: number
  crossSize: number
}


/* -------------------------
        Custom Event typing
    -------------------------- */
// export type ReactionEvent = CustomEvent<CtxType>

export type ReactionEvent = CustomEvent<EventType>