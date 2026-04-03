export type Axis = 'horizontal' | 'vertical' | 'both'
export type Axis1D = 'horizontal' | 'vertical'
export type EventBridgeType = 'down' | 'move' | 'up'
// export type Direction = 'left' | 'right' | 'up' | 'down'

export type Direction =
  | { axis: 'horizontal'; dir: 'left' | 'right' }
  | { axis: 'vertical'; dir: 'up' | 'down' }
  | { axis: 'both'; dir: 'left' | 'right' | 'up' | 'down' }

export type InteractionType = 'button' | 'carousel' | 'slider' | 'drag'
export type DataKeys = Exclude<InteractionType, 'button'>;

export type EventType =
  | 'swipeStart'
  | 'swipe'
  | 'swipeCommit'
  | 'swipeRevert'
  | 'press'
  | 'pressRelease'
  | 'pressCancel'

export interface Vec2 {
  x: number
  y: number
}

// export type Mutable<T> = {
//   -readonly [K in keyof T]: T[K]
// }