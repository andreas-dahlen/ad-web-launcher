export type Axis = 'horizontal' | 'vertical' | 'both'
export type Axis1D = 'horizontal' | 'vertical'
export type EventBridgeType = 'down' | 'move' | 'up'

export type SceneRole = "prev" | "current" | "next"

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

export const VALID_AXES = new Set<Axis>(['horizontal', 'vertical', 'both'])
export const VALID_TYPES = new Set<InteractionType>(['button', 'carousel', 'slider', 'drag'])

export function toAxis(v: string | undefined): Axis | null {
  return v != null && VALID_AXES.has(v as Axis) ? v as Axis : null
}
export function toType(v: string | undefined): InteractionType | null {
  return v != null && VALID_TYPES.has(v as InteractionType) ? v as InteractionType : null
}