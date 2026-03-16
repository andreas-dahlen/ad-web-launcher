/* =========================================================
Core engine primitives
- Axis, Event types, primitives
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

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}
/* =========================================================
Gesture data (static data describing gestures)
- Base
========================================================= */

export interface BaseInteraction {
  // type: InteractionType Is added later
  element: HTMLElement
  id: string
  axis: Axis | null
  baseOffset: Vec2
  actionId?: string
}
/* =========================================================
Gesture data (static data describing gestures)
- CarouselData, SliderData, DragData & modifiers
========================================================= */

export interface CarouselData {
  index: number
  size: Vec2
}

export interface SliderData {
  thumbSize: Vec2
  constraints: { min: number; max: number }
  size: Vec2
}

export interface DragData {
  position: Vec2
  constraints: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

export interface Modifiers {
  //added during construction.
  //carousel
  lockSwipeAt?: { prev: number; next: number }
  //drag
  snap?: Vec2
  locked?: boolean
}

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

export type RuntimeData = {
  event: EventType
  delta: Vec2,
  delta1D?: number,
  stateAccepted?: boolean
  cancel?: CancelData
  gestureUpdate?: GestureUpdate
  direction?: Direction
  sliderStartOffset?: number
  sliderValuePerPixel?: number
}
export type RuntimePatch = Partial<RuntimeData>
/* =========================================================
   Gesture system mapping
   - Maps gesture types to their data
   ========================================================= */
type InteractionDataMap = {
  button: Record<string, never>
  carousel: CarouselData
  slider: SliderData
  drag: DragData
}

// All types
export type InteractionType = keyof InteractionDataMap
//Swipe types
export type DataKeys = Exclude<InteractionType, 'button'>
// Partial used for building descriptors
export type SwipeData = InteractionDataMap[DataKeys] & Modifiers

/* =========================================================
   Descriptor system
   ========================================================= */

type InteractionDescriptor<K extends InteractionType> = {
  base: BaseInteraction & { type: K }
  data: InteractionDataMap[K] & Modifiers
  reactions: Reactions
  runtime: RuntimeData
}

export type DescriptorOf<K extends InteractionType> =
  InteractionDescriptor<K>

  export type DescriptorMap = {
    [K in InteractionType]: InteractionDescriptor<K>
  }

  export type Descriptor = DescriptorMap[InteractionType]
  
  export type DescriptorType<T extends Descriptor> = T["base"]["type"]
  
export type DragDescriptor = InteractionDescriptor<'drag'>
export type CarouselDescriptor = InteractionDescriptor<'carousel'>
export type SliderDescriptor = InteractionDescriptor<'slider'>
export type ButtonDescriptor = InteractionDescriptor<'button'>
export type SwipeDescriptor = DescriptorMap[DataKeys]


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

export type StateFn2Arg =
  | 'getSize'
  | 'getThumbSize'
  | 'getPosition'
  | 'getConstraints'
  | 'getCurrentIndex'
  | 'get'
  | 'ensure'
  | 'press'
  | 'swipeStart'
  | 'swipe'
  | 'swipeCommit'
  | 'swipeRevert'

export type StateFn3Arg =
  | 'setCount'
  | 'setSize'
  | 'setThumbSize'
  | 'setPosition'
  | 'setConstraints'

