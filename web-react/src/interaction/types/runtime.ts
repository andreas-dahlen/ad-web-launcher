import type { GestureUpdate,  } from "./data.ts"
import type { CancelData } from "./base.ts"
import type { Vec2 } from "./primitives.ts"
import type { Direction } from "./primitives.ts"

export type CarouselRuntime = {
  stateAccepted?: boolean
  delta1D?: number
  eventChange?: string
  direction?: Direction
  cancel?: CancelData
  
}

export type SliderRuntime = {
  stateAccepted?: boolean
  delta1D?: number
  gestureUpdate?: GestureUpdate
  
  // sliderStartOffset?: number //should be in data only optional i believe.. 
  // sliderValuePerPixel?: same placement as above
  cancel?: CancelData
}

export type DragRuntime = {
  stateAccepted?: boolean
  // direction?: Direction not sure why this is needed :S it is solved in dragSolver ... but no idea why it would be needed...
  delta?: Vec2
  cancel?: CancelData
}
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