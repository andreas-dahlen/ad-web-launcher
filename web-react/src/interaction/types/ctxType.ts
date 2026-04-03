import type { GestureUpdate } from '@interaction/types/descriptor/dataType'
import type { Direction, EventType, Vec2 } from '@interaction/types/primitiveType'

export interface CancelData {
  element: HTMLElement
  pressCancel: boolean
}

export type CtxBase = {
  event: EventType
  id: string
  element: HTMLElement
  stateAccepted: boolean
}

export type CtxButton = CtxBase & {
  type: 'button'
}

export type CtxCarousel = CtxBase & {
  type: 'carousel'
  delta: Vec2
  cancel?: CancelData

  delta1D?: number
  // eventChange?: string
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

  // direction?: Direction not sure why this is needed :S it is solved in dragSolver ... but no idea why it would be needed...
}

export type CtxType =
  | CtxCarousel
  | CtxSlider
  | CtxDrag
  | CtxButton

export type CtxSwipeType = Exclude<CtxType, CtxButton>