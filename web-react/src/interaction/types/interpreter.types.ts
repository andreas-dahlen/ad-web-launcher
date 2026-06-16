import type { Computed } from '@interaction/types/computed.types'
import type { Descriptor, SwipeableDescriptor } from '@interaction/types/descriptor.types'
import type { RuntimePress, RuntimePressRelease, RuntimeSwipe, RuntimeCommit, RuntimeStart } from '@interaction/types/runtime.types'
import type { Axis, Vec2 } from '@typing/core.types'
/*
  UTILS
*/
export type PendingContext = {
  thresholdValue: Vec2
  intentAxis: Axis
}


/*----------------------------------- 
        InterpreterOutput
------------------------------------*/
// export interface InterpreterOutput {
//   desc: Readonly<Descriptor>
//   computed: Readonly<Computed>
//   runtime: Runtime
// }

export type InterpreterPress = {
  desc: Readonly<Descriptor>
  runtime: RuntimePress
  computed: null
}
export type InterpreterSwipeStart = {
  desc: Readonly<SwipeableDescriptor>
  runtime: RuntimeStart
  computed: null
}
export type InterpreterSwipe = {
  desc: Readonly<SwipeableDescriptor>
  runtime: RuntimeSwipe
  computed: Computed
}
export type InterpreterSwipeCommit = {
  desc: Readonly<SwipeableDescriptor>
  runtime: RuntimeCommit
  computed: Computed
}
export type InterpreterPressRelease = {
  desc: Readonly<Descriptor>
  runtime: RuntimePressRelease
  computed: null
}

export type InterpreterOutput =
  | InterpreterPress
  | InterpreterSwipeStart
  | InterpreterSwipe
  | InterpreterSwipeCommit
  | InterpreterPressRelease

/*---------------------------------------------
SessionState!
--------------------------------------------*/
export type PendingSession = {
  phase: 'PENDING'
  pointerId: number
  state: SessionState
  gesture: { desc: Readonly<Descriptor>; computed: null }
}

export type SwipingSession = {
  phase: 'SWIPING'
  pointerId: number
  state: SessionState
  gesture: { desc: Readonly<SwipeableDescriptor>; computed: Readonly<Computed> | null }
}

export type GestureSession = PendingSession | SwipingSession
interface SessionState {
  start: Vec2
  last: Vec2
  totalDelta: Vec2

  isLongPress: boolean
}