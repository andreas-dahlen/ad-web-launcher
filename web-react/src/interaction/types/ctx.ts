import type { GestureUpdate } from '@interaction/types/data'
import type { Direction, EventType, Vec2 } from '@interaction/types/primitives'




export interface CancelData {
  element: HTMLElement
  pressCancel: boolean
}

export type RuntimeBase = {
  event: EventType,
  stateAccepted: boolean
}

export type RuntimeCarousel = RuntimeBase & {
  delta: Vec2,
  cancel?: CancelData

  delta1D?: number
  eventChange?: string
  direction?: Direction
}

export type RuntimeSlider = RuntimeBase & {
  delta: Vec2,
  cancel?: CancelData

  delta1D?: number
  gestureUpdate?: GestureUpdate
}

export type RuntimeDrag = RuntimeBase & {

  delta: Vec2,
  cancel?: CancelData

  // direction?: Direction not sure why this is needed :S it is solved in dragSolver ... but no idea why it would be needed...
}

// export type RuntimeButton = {
//   event: EventType,
//   stateAccepted: boolean
//   // delta: Vec2,
// }

export type RuntimeMap = {
  carousel: RuntimeCarousel
  slider: RuntimeSlider
  drag: RuntimeDrag
}

export type RuntimeType =
  | RuntimeCarousel
  | RuntimeSlider
  | RuntimeDrag

