import { log } from '../../test/functions.ts'
import { gestureUtils } from './gestureUtils.ts'
import { domQuery } from './domQuery.ts'
import type { Axis, EventType, Vec2 } from '../../shared/typing/core.types.ts'
import type { Descriptor } from '../types/descriptor.types.ts'
import type { Runtime } from '@interaction/types/Runtime.types.ts'
import type { ComputedPatch } from '@interaction/types/computed.types.ts'



/* ========================
   Gesture state
=========================== */
type GestureMap = Partial<Record<number, GestureSession>>
const gestures: GestureMap = {}


interface GestureSession {
  pointerId: number
  desc: Descriptor
  state: SessionState
}
interface SessionState {
  phase: 'PENDING' | 'SWIPING'
  start: Vec2
  last: Vec2
  totalDelta: Vec2
  computed: ComputedPatch
}
export interface GestureInput {
  gesture: Readonly<Gesture>
  runtime: Runtime
}
type Gesture = {
  desc: Descriptor
  computed: ComputedPatch
}
/* ========================
   Public API
=========================== */
export const interpreter = {
  onDown,
  onMove,
  onUp,
  applyComputedUpdate,
  deleteGesture
}

function applyComputedUpdate(update: ComputedPatch, pointerId: number) {
  const g = gestures[pointerId]
  if (!g) return
  g.state.computed = {
    ...g.state.computed,
    ...update,
  }
}

function deleteGesture(pointerId: number) {
  delete gestures[pointerId]
  return null
}

/* =====================
   Event handlers
======================== */
function onDown(x: number, y: number, pointerId: number): GestureInput | null {
  if (Object.keys(gestures).length > 10) {
    const entries = Object.entries(gestures)
    const [key] = entries.find(([, g]) => g?.state.phase === 'PENDING') ?? entries[0]
    console.warn('Gesture map overflow, evicting oldest gesture')
    delete gestures[Number(key)]
  }

  const resolved = domQuery.findTargetInDom(x, y, pointerId)
  if (!resolved) return null
  gestures[pointerId] = {
    pointerId: pointerId,
    state: {
      phase: 'PENDING',
      start: gestureUtils.normalizeVec2({ x, y }),
      last: gestureUtils.normalizeVec2({ x, y }),
      totalDelta: { x: 0, y: 0 },
      computed: {}
    },
    desc: resolved,
  }
  const g = gestures[pointerId]

  if (g.desc.capabilities.pressable) {
    return {
      gesture: {
        desc: g.desc,
        computed: g.state.computed
      },
      runtime: {
        event: 'press',
        delta: { x, y }
      }
    }
  }
  return null
}

function onMove(x: number, y: number, pointerId: number): GestureInput | null {
  const g = gestures[pointerId]
  if (!g) return null
  const point = gestureUtils.normalizeVec2({ x, y })
  const absX = Math.abs(point.x - g.state.start.x)
  const absY = Math.abs(point.y - g.state.start.y)
  const biggest = Math.max(absX, absY)
  /* -----------------------------------
     Pending → swipe start
  ------------------------------------- */

  if (g.state.phase === 'PENDING') {
    if (!g.desc) return null
    if (!gestureUtils.swipeThresholdCalc(biggest, g.desc.capabilities.instantSwipe)) return null
    const intentAxis: Axis = absX > absY ? 'horizontal' : 'vertical'

    const resolved = gestureUtils.isSwipeableDescriptor(g.desc, intentAxis)
      ? g.desc
      : domQuery.findLaneInDom(x, y, intentAxis, g.desc.base.pointerId)

    //FUTURE return pressCancel if unresolved 
    if (!resolved) return null
    const thresholdValue = { x: point.x - g.state.last.x, y: point.y - g.state.last.y }

    g.state.phase = 'SWIPING'
    g.state.last.x = point.x
    g.state.last.y = point.y

    const cancel = g.desc.capabilities.pressable
      && resolved !== g.desc
      ? { element: g.desc.base.element, pressCancel: true }
      : undefined

    g.desc = resolved

    if (g.desc.capabilities.swipeable) {
      return {
        gesture: {
          desc: g.desc,
          computed: g.state.computed
        },
        runtime: {
          event: 'swipeStart',
          delta: { x, y },
          cancel: cancel,
          thresholdValue
        }
      }
    }
    return null
  }

  /* ---------------------------
     Active swipe
  ----------------------------- */
  if (g.state.phase === 'SWIPING' && g.desc) {

    const deltaX = point.x - g.state.last.x
    const deltaY = point.y - g.state.last.y

    g.state.totalDelta.x += deltaX
    g.state.totalDelta.y += deltaY

    g.state.last.x = point.x
    g.state.last.y = point.y

    return {
      gesture: {
        desc: g.desc,
        computed: g.state.computed
      },
      runtime: {
        event: 'swipe',
        delta: g.state.totalDelta,
        cancel: undefined
      }
    }
  }
  return null
}

function onUp(_x: number, _y: number, pointerId: number): GestureInput | null {
  const g = gestures[pointerId]
  if (!g) return null

  if (g.state.phase === 'SWIPING') return finalizeGesture(g, 'swipeCommit')
  if (g.state.phase === 'PENDING') return finalizeGesture(g, 'pressRelease')

  delete gestures[g.pointerId]
  log('init', 'gesture.phase error:', g.state.phase)
  return null
}

function finalizeGesture(g: GestureSession, event: EventType): GestureInput | null {
  if (event === 'pressRelease' && !g.desc.capabilities.pressable) {
    delete gestures[g.pointerId]
    return null
  }
  if (event === 'swipeCommit' && !g.desc.capabilities.swipeable) {
    delete gestures[g.pointerId]
    return null
  }
  const descriptor = g.desc
  const state = g.state.computed
  delete gestures[g.pointerId]
  return {
    gesture: {
      desc: descriptor,
      computed: state
    },
    runtime: {
      event: event,
      delta: { x: 0, y: 0 }
    }
  }
}