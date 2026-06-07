import type { Computed } from '@interaction/types/computed.types'
import type { Descriptor } from '@interaction/types/descriptor.types'
import type { Runtime } from '@interaction/types/runtime.types'
import type { Axis, Vec2 } from '@typing/core.types'
/*
  UTILS
*/
export type PendingContext = {
  thresholdValue: Vec2
  intentAxis: Axis
}


/* 

*/
type GestureSnapshot = {
  desc: Readonly<Descriptor>
  computed: Computed
}
export interface InterpreterOutput {
  desc: Readonly<Descriptor>
  computed: Readonly<Computed>
  runtime: Runtime
}

/*
---------------------------------------------
        SessionState!
--------------------------------------------
*/
export interface GestureSession {
  pointerId: Readonly<number>
  gesture: GestureSnapshot
  state: SessionState
}
export type SessionState = BaseSessionState & {
  phase: 'PENDING' | "SWIPING"
}
interface BaseSessionState {
  start: Vec2
  last: Vec2
  totalDelta: Vec2
}