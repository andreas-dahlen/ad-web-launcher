

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
  storeAccepted: false
} | {
  storeAccepted: true
  delta: Vec2
}


// export type CtxButton = RuntimeBase & {
//   type: 'button'
// }

// export type CtxCarousel = CtxBaseSwipe & {
//   type: 'carousel'

//   delta1D?: number
//   direction?: Direction
// }

// export type CtxSlider = CtxBaseSwipe & {
//   type: 'slider'

//   delta1D?: number
//   gestureUpdate?: GestureUpdate
// }

// export type CtxScroll = CtxBaseSwipe & {
//   type: 'scroll'

//   delta1D?: number
//   overflowValue?: number
//   isVisible?: boolean

//   gestureUpdate?: GestureUpdate
// }

// export type CtxDrag = CtxBaseSwipe & {
//   type: 'drag'
// }

// export type CtxType =
//   | CtxCarousel
//   | CtxSlider
//   | CtxDrag
//   | CtxButton
//   | CtxScroll

// /* -------------------------
//         Solvers
//     -------------------------- */

// export type CarouselCtxPartial = Partial<Pick<CtxCarousel, 'delta1D' | 'direction' | 'storeAccepted' | 'event'>>
// export type SliderCtxPartial = Partial<Pick<CtxSlider, 'delta1D' | 'gestureUpdate' | 'storeAccepted'>>
// export type DragCtxPartial = Partial<Pick<CtxDrag, 'storeAccepted' | 'delta'>>
// export type ScrollCtxPartial = Partial<Pick<CtxScroll,
//   'delta1D' | 'overflowValue' | 'storeAccepted' | 'gestureUpdate'>>

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

/* -------------------------
        Custom Event typing
    -------------------------- */
// export type ReactionEvent = CustomEvent<CtxType>

export type ReactionEvent = CustomEvent<EventType>