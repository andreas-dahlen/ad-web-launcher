declare global {
/* =========================================================
Core engine primitives
- Axis, Event types, primitives
========================================================= */

type Axis = 'horizontal' | 'vertical' | 'both'

type EventBridgeType = 'down' | 'move' | 'up'

type Direction = 'left' | 'right' | 'up' | 'down'

type EventType =
  | 'swipeStart'
  | 'swipe'
  | 'swipeCommit'
  | 'swipeRevert'
  | 'press'
  | 'pressRelease'
  | 'pressCancel'

interface Vec2 {
  x: number
  y: number
}

type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}
/* =========================================================
Gesture data (static data describing gestures)
- Base
========================================================= */

interface BaseInteraction {
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

interface CarouselData {
  index: number
  size: Vec2
}

interface SliderData {
  thumbSize: Vec2
  constraints: { min: number; max: number }
  size: Vec2
}

interface DragData {
  position: Vec2
  constraints: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

interface Modifiers {
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

interface CancelData {
  element: HTMLElement
  pressCancel: boolean
}

interface Reactions {
  pressable: boolean
  swipeable: boolean
  modifiable: boolean
}

interface GestureUpdate {
  sliderStartOffset?: number
  sliderValuePerPixel?: number
  /* Allow solvers to attach extra runtime params */
  [key: string]: unknown
}

type RuntimeData = {
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
type RuntimePatch = Partial<RuntimeData>
/* =========================================================
   Gesture system mapping
   - Maps gesture types to their data
   ========================================================= */
type InteractionDataMap = {
// source: 'button' |
  button: null
  carousel: CarouselData
  slider: SliderData
  drag: DragData
}

// All types
type InteractionType = keyof InteractionDataMap
//Swipe types
type DataKeys = Exclude<InteractionType, 'button'>
// Partial used for building descriptors
type SwipeData = InteractionDataMap[DataKeys] & Modifiers

/* =========================================================
   Descriptor system
   ========================================================= */

type InteractionDescriptor<K extends InteractionType> = {
  base: BaseInteraction & { type: K }
  data: InteractionDataMap[K] & Modifiers
  reactions: Reactions
  runtime: RuntimeData
}

// let xs: Array<number> = [1,2,3]
// type Exempel<T> = {
//   x: T
//   y: T[]
// }
// let o: Exempel<boolean> = { x: 5, y: [false,true] }

type DescriptorOf<K extends InteractionType> =
  InteractionDescriptor<K>

type DescriptorMap = {
    [K in InteractionType]: InteractionDescriptor<K>
  }

 type Descriptor = DescriptorMap[InteractionType]
  
type DescriptorType<T extends Descriptor> = T["base"]["type"]
  
type DragDescriptor = InteractionDescriptor<'drag'>
type CarouselDescriptor = InteractionDescriptor<'carousel'>
type SliderDescriptor = InteractionDescriptor<'slider'>
type ButtonDescriptor = InteractionDescriptor<'button'>
type SwipeDescriptor = DescriptorMap[DataKeys]


/* =========================================================
   SolverUtils
   - Normalized1D
   ========================================================= */
interface Normalized1D {
  mainTrackSize?: number | null
  crossTrackSize?: number | null
  mainThumbSize?: number | null
  crossThumbSize?: number | null
  mainOffset?: number | null
  crossOffset?: number | null
  mainDelta?: number | null
  crossDelta?: number | null
}

type StateFn2Arg =
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

type StateFn3Arg =
  | 'setCount'
  | 'setSize'
  | 'setThumbSize'
  | 'setPosition'
  | 'setConstraints'

}
export {}