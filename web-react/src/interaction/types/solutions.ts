import type { GestureUpdate, } from "./data.ts"
import type { Vec2 } from "./primitives.ts"
import type { Direction } from "./primitives.ts"

export type CarouselSolutions = {
  stateAccepted?: boolean
  delta1D?: number
  eventChange?: string
  direction?: Direction
}

export type SliderSolutions = {
  stateAccepted?: boolean
  delta1D?: number
  gestureUpdate?: GestureUpdate
}

export type DragSolutions = {
  stateAccepted?: boolean
  // direction?: Direction not sure why this is needed :S it is solved in dragSolver ... but no idea why it would be needed...
  delta?: Vec2
}

export type Solutions =
  | CarouselSolutions
  | SliderSolutions
  | DragSolutions

// export type RuntimeData = {
//   event: EventType
//   delta: Vec2,
//   delta1D?: number,
//   stateAccepted?: boolean
//   cancel?: CancelData
//   gestureUpdate?: GestureUpdate
//   direction?: Direction
//   sliderStartOffset?: number
//   sliderValuePerPixel?: number
// }

// export type RuntimeMap = {
//   carousel: { event: EventType; delta: Vec2; direction?: Direction; stateAccepted?: boolean; cancel?: CancelData }
//   drag: { event: EventType; delta: Vec2; position: Vec2; cancel?: CancelData }
//   slider: { event: EventType; delta: Vec2; delta1D: number; sliderStartOffset?: number; sliderValuePerPixel?: number }
//   button: { event: EventType }
// }