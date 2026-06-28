export type PlusMinusOne = 1 | -1

export type Axis = Axis1D | Axis2D
export type Axis1D = 'horizontal' | 'vertical'
export type Axis2D = 'both'


export type EventBridgeType = 'down' | 'move' | 'up'
type LeftOrRight = 'left' | 'right'
type UpOrDown = 'up' | 'down'

type Dir = LeftOrRight | UpOrDown
export type AxisDirection =
  | { axis: 'horizontal'; dir: LeftOrRight }
  | { axis: 'vertical'; dir: UpOrDown }
  | { axis: 'both'; dir: Dir }

export type BoxSide = 'left' | 'right' | 'top' | 'bottom'
export type SceneRole = "prev" | "current" | "next"
export type InteractionType = 'button' | 'carousel' | 'slider' | 'drag' | 'scroll'
// export type SwipeType = Exclude<InteractionType, 'button'>;

export type EventType =
  | 'press'
  | 'swipeStart'
  | 'swipe'
  | 'swipeCommit'
  | 'swipeRevert'
  | 'pressRelease'
  | 'pressCancel'

export type Press = { event: "press" }
export type SwipeStart = { event: "swipeStart" }
export type Swipe = { event: "swipe" }
export type SwipeCommit = { event: "swipeCommit" }
export type SwipeRevert = { event: "swipeRevert" }

// export type InitialEventType =
//   | 'press'
//   | 'swipeStart'

// export type SwipingEventType =
//   | 'swipe'
//   | 'swipeCommit'

// export type SideEffectEventType =
//   | 'swipeRevert'
//   | 'pressRelease'
//   | 'pressCancel'

export interface Vec2 {
  x: number
  y: number
}

export type Delta = { delta: Vec2 }

export interface Size2D {
  width: number
  height: number
}

export type Constraints1D = {
  min: number
  max: number
}
export type Constraints2D = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

