/* =========================================================
Core engine primitives
- Axis, Event types
========================================================= */

export type Axis = 'horizontal' | 'vertical' | 'both'

export type EventBridgeType = 'down' | 'move' | 'up'

export type Direction = 'left' | 'right' | 'up' | 'down'

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

export type VecOrScalar = Vec2 | number

/* =========================================================
   Gesture data (static data describing gestures)
   - CarouselData, SliderData, DragData
   ========================================================= */

export interface CarouselData {
  index: number
  size: Vec2
  lockSwipeAt?: { prev: number; next: number }
}

export interface SliderData {
  thumbSize: Vec2
  constraints: { min: number; max: number }
  size: Vec2
  //added through gestureUpdate
  sliderStartOffset?: number
  sliderValuePerPixel?: number
}

export interface DragData {
  position: Vec2
  constraints: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
  snap?: Vec2
  locked?: boolean
}


/* =========================================================
   Gesture system mapping
   - Maps gesture types to their data
   ========================================================= */

export interface GestureMap {
  carousel: CarouselData
  slider: SliderData
  drag: DragData
}

export type SwipeData = Partial<GestureMap>

export type GestureType = keyof GestureMap | 'button'

export type SwipeType = Exclude<GestureType, 'button'>
/* =========================================================
   Runtime data (produced during gesture pipeline)
   - CancelData, Reactions, GestureUpdate, RuntimeData
   ========================================================= */

export interface CancelData {
  element: HTMLElement
  pressCancel: boolean
}

export interface Reactions {
  pressable: boolean
  swipeable: boolean
  modifiable: boolean
}

export interface GestureUpdate {
  sliderStartOffset?: number
  sliderValuePerPixel?: number

  /* Allow solvers to attach extra runtime params */
  [key: string]: unknown
}

export interface RuntimeData {
  event?: EventType
  cancel?: CancelData
  reactions?: Reactions
  stateAccepted?: boolean
  gestureUpdate?: GestureUpdate
  delta?: VecOrScalar
}




/* =========================================================
   Descriptor system
   - BaseDescriptor + SwipeData + RuntimeData
   ========================================================= */

export interface BaseDescriptor {
  element: HTMLElement
  id: string
  axis?: Axis
  type?: GestureType
  actionId?: string
  startOffset?: Vec2
}

/**
 * Descriptor
 *
 * Unified object passed through the interaction engine.
 * Combines:
 * - Base DOM descriptor data
 * - Gesture-specific data
 * - Runtime pipeline state
 */
export type Descriptor =
  BaseDescriptor &
  SwipeData &
  RuntimeData & 
  GestureMap & {
    /* Allow solvers / plugins to extend descriptor */
    [key: string]: unknown
  }

/* =========================================================
   SolverUtils
   - Normalized1D
   ========================================================= */
export interface Normalized1D {
  mainTrackSize?: number | null
  crossTrackSize?: number | null
  mainThumbSize?: number | null
  crossThumbSize?: number | null
  mainOffset?: number | null
  crossOffset?: number | null
  mainDelta?: number | null
  crossDelta?: number | null
}

export type StateFnName = 
  | 'getSize'
  | 'getThumbSize'
  | 'getPosition'
  | 'getConstraints'
  | 'getCurrentIndex'
  | 'get'
  | 'ensure'
  | 'setCount'
  | 'setSize'
  | 'setThumbSize'
  | 'setPosition'
  | 'setConstraints'
  | 'press'
  | 'swipeStart'
  | 'swipe'
  | 'swipeCommit'
  | 'swipeRevert'