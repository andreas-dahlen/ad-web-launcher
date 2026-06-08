import type { Computed, ScrollComputed, SliderComputed } from '@interaction/types/computed.types'

export type Axis = Axis1D | Axis2D
export type Axis1D = 'horizontal' | 'vertical'
export type Axis2D = 'both'
export type EventBridgeType = 'down' | 'move' | 'up'
type LeftOrRight = 'left' | 'right'
type UpOrDown = 'up' | 'down'


//used for carousel commit
export type Direction =
  | { axis: 'horizontal'; dir: LeftOrRight }
  | { axis: 'vertical'; dir: UpOrDown }
  | { axis: 'both'; dir: LeftOrRight | UpOrDown }

export type OnEdgeDir = 'left' | 'right' | 'up' | 'down'
export type SceneRole = "prev" | "current" | "next"
export type InteractionType = 'button' | 'carousel' | 'slider' | 'drag' | 'scroll'
// export type DataKeys = Exclude<InteractionType, 'button'>;

export type EventType =
  | 'press'
  | 'swipeStart'
  | 'swipe'
  | 'swipeCommit'
  | 'swipeRevert'
  | 'pressRelease'
  | 'pressCancel'

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

export type delta = { delta: Vec2 }

export interface Size2D {
  width: number
  height: number
}
export const VALID_DIRS = new Set<OnEdgeDir>(['left', 'right', 'up', 'down'])

export const VALID_AXES = new Set<Axis>(['horizontal', 'vertical', 'both'])
export const VALID_TYPES = new Set<InteractionType>(['button', 'carousel', 'slider', 'drag', 'scroll'])

export function toAxis(v: string | undefined): Axis | null {
  return v != null && VALID_AXES.has(v as Axis) ? v as Axis : null
}
export function toType(v: string | undefined): InteractionType | null {
  return v != null && VALID_TYPES.has(v as InteractionType) ? v as InteractionType : null
}

export function toOnEdgeDir(onEdgeDir: string | undefined): OnEdgeDir | null {
  return onEdgeDir != null && VALID_DIRS.has(onEdgeDir as OnEdgeDir) ? onEdgeDir as OnEdgeDir : null
}

export function assertAxis(v: string): asserts v is Axis {
  if (!VALID_AXES.has(v as Axis)) {
    throw new Error('Invalid axis')
  }
}

export function assertSliderComputed(computed: Computed): asserts computed is SliderComputed {
  if (!computed) throw new Error("computed is required for slider")
}
export function assertScrollComputed(computed: Computed): asserts computed is ScrollComputed {
  if (!computed) throw new Error("computed is required for scroll")
}

export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`)
}

