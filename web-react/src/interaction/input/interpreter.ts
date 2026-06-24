import { gestureUtils } from './gesture.utils.ts'
import { domQuery } from './domQuery.ts'
import type { ComputedPackage } from '@interaction/types/runtime/computed.types.ts'
import type { GestureSession, PendingContext, InterpreterPress, InterpreterSwipeStart, InterpreterSwipe, InterpreterSwipeCommit, InterpreterPressRelease, SwipingSession, PendingSession } from '@interaction/types/runtime/interpreter.types.ts'
import type { Axis, EventType, Vec2 } from '@typing/core.types.ts'
import { assertNever } from '@utils/assertions.ts'
export function returnGesturesForTests() {
  return gestures
}
export function resetGesturesForTests() {
  for (const key in gestures) {
    delete gestures[key]
  }
}
export function modifyGestureForTests(id: number, any: GestureSession) {
  gestures[id] = { ...any }
}

/* ========================
   Gesture state
=========================== */
type GestureMap = Partial<Record<number, GestureSession>>
const gestures: GestureMap = {}


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

function applyComputedUpdate(update: ComputedPackage) {
  const g = gestures[update.pointerId]
  if (!g) return
  g.gesture.computed = update
  //TODO possibly assert something here... computed is no longer null!
}

function deleteGesture(pointerId: number) {
  delete gestures[pointerId]
  return null
}

/* =====================
   Event handlers
======================== */
function onDown(x: number, y: number, pointerId: number): InterpreterPress | null {
  if (Object.keys(gestures).length > 10) {
    const entries = Object.entries(gestures)
    const [key] = entries.find(([, g]) => g?.phase === 'PENDING') ?? entries[0]
    console.warn('Gesture map overflow, evicting oldest gesture')
    delete gestures[Number(key)]
  }

  const resolved = domQuery.findTargetInDom(x, y, pointerId)
  if (!resolved) return null
  gestures[pointerId] = {
    pointerId: pointerId,
    phase: 'PENDING',
    state: {
      start: gestureUtils.normalizeVec2({ x, y }),
      last: gestureUtils.normalizeVec2({ x, y }),
      totalDelta: { x: 0, y: 0 },
      isLongPress: false
    },
    gesture: {
      desc: resolved,
      computed: null
    }
  }
  // if(resolved.desc.base.isLongPressable) startGestureSession(pointerId)
  const g = gestures[pointerId].gesture
  if (g.desc.capabilities.pressable) {
    return {
      desc: g.desc,
      computed: null,
      runtime: {
        event: 'press',
        delta: { x, y },
        isLongPress: false
      }
    }
  }
  return null
}

function onMove(x: number, y: number, pointerId: number): InterpreterSwipeStart | InterpreterSwipe | null {
  const current = gestures[pointerId]
  if (!current) return null
  const point = gestureUtils.normalizeVec2({ x, y })
  switch (current.phase) {
    case 'PENDING': {
      const pendingContext = handlePendingMove(current, point)
      if (!pendingContext) return null
      return handleSwipeStart(current, x, y, point, pendingContext)
    }
    case 'SWIPING':
      return handleSwipeMove(point, pointerId)
    default:
      return null
  }
}

function handlePendingMove(current: GestureSession, point: Vec2): PendingContext | null {
  const { gesture: g, state } = current
  const absX = Math.abs(point.x - state.start.x)
  const absY = Math.abs(point.y - state.start.y)
  const biggest = Math.max(absX, absY)
  if (!gestureUtils.swipeThresholdCalc(biggest, g.desc.capabilities.instantSwipe)) return null
  const intentAxis: Axis = absX > absY ? 'horizontal' : 'vertical'
  const thresholdValue = { x: point.x - state.last.x, y: point.y - state.last.y }
  return { thresholdValue, intentAxis }
}

function handleSwipeStart(current: GestureSession, x: number, y: number, point: Vec2, ctx: PendingContext): InterpreterSwipeStart | null {
  const swipeDesc = gestureUtils.asSwipeableDescriptor(current.gesture.desc, ctx.intentAxis)
  if (swipeDesc) {
    current.phase = 'SWIPING'
    current.state.last = point
    return {
      desc: swipeDesc,
      computed: null,
      runtime: {
        event: 'swipeStart',
        delta: { x, y },
        thresholdValue: ctx.thresholdValue,
        isLongPress: current.state.isLongPress
      }
    }
  }
  const newDesc = domQuery.findLaneInDom(x, y, ctx.intentAxis, current.pointerId)
  if (!newDesc) return null

  const originalDesc = current.gesture.desc

  gestures[current.pointerId] = {
    pointerId: current.pointerId,
    phase: 'SWIPING',
    state: {
      start: current.state.start,
      last: point,
      totalDelta: { x: 0, y: 0 },
      isLongPress: current.state.isLongPress
    },
    gesture: {
      desc: newDesc,
      computed: null
    }
  }

  const cancel = originalDesc.capabilities.pressable
    ? { element: originalDesc.base.element, pressCancel: true }
    : undefined

  return {
    desc: newDesc,
    computed: null,
    runtime: {
      event: 'swipeStart',
      delta: { x, y },
      cancel,
      thresholdValue: ctx.thresholdValue,
      isLongPress: current.state.isLongPress
    }
  }
}

/* ---------------------------
   Active swipe
----------------------------- */
function handleSwipeMove(point: Vec2, pointerId: number): InterpreterSwipe | null {
  const current = gestures[pointerId]
  if (!current) return null

  if (current.phase === 'PENDING') return null
  const { state, gesture: g } = current
  const deltaX = point.x - state.last.x
  const deltaY = point.y - state.last.y

  state.totalDelta.x += deltaX
  state.totalDelta.y += deltaY

  state.last.x = point.x
  state.last.y = point.y

  return {
    desc: g.desc,
    computed: g.computed,
    runtime: {
      event: 'swipe',
      delta: state.totalDelta,
      isLongPress: state.isLongPress
    }
  }
}

function onUp(_x: number, _y: number, pointerId: number): InterpreterSwipeCommit | InterpreterPressRelease | null {
  const current = gestures[pointerId]
  if (!current) return null

  if (current.phase === 'SWIPING') return finalizeSwipe(current, "swipeCommit")
  if (current.phase === 'PENDING') return finalizePress(current, "pressRelease")

  assertNever(current)
}

function finalizeSwipe(current: SwipingSession, event: Extract<EventType, "swipeCommit">) {
  const { state, gesture: g } = current
  if (!g.desc.capabilities.swipeable) {
    delete gestures[current.pointerId]
    return null
  }
  delete gestures[current.pointerId]
  return {
    desc: g.desc,
    computed: g.computed,
    runtime: {
      event: event,
      delta: state.totalDelta,
      isLongPress: state.isLongPress
    }
  }
}


function finalizePress(current: PendingSession, event: Extract<EventType, "pressRelease">) {
  const { state, gesture: g } = current
  if (!g.desc.capabilities.pressable) {
    delete gestures[current.pointerId]
    return null
  }
  delete gestures[current.pointerId]
  return {
    desc: g.desc,
    computed: null,
    runtime: {
      event: event,
      delta: state.totalDelta,
      isLongPress: state.isLongPress
    }
  }
}