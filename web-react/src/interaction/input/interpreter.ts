import { log } from '../../test/functions.ts'
import { gestureUtils } from './gestureUtils.ts'
import { domQuery } from './domQuery.ts'
import type { Axis, EventType, Vec2 } from '../../shared/typing/core.types.ts'
import type { ComputedPatch } from '@interaction/types/computed.types.ts'
import type { InterpreterOutput, GestureSession, PendingContext } from '@interaction/types/gesture.types.ts'



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

function applyComputedUpdate(update: ComputedPatch, pointerId: number) {
  const g = gestures[pointerId]
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
function onDown(x: number, y: number, pointerId: number): InterpreterOutput | null {
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
    },
    gesture: {
      desc: resolved,
      computed: null
    }
  }
  const g = gestures[pointerId].gesture

  if (g.desc.capabilities.pressable) {
    return {
      desc: g.desc,
      computed: g.computed,
      runtime: {
        event: 'press',
        delta: { x, y }
      }
    }
  }
  return null
}

function onMove(x: number, y: number, pointerId: number): InterpreterOutput | null {
  const current = gestures[pointerId]
  if (!current) return null
  const point = gestureUtils.normalizeVec2({ x, y })
  switch (current.state.phase) {
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

function handleSwipeStart(current: GestureSession, x: number, y: number, point: Vec2, ctx: PendingContext): InterpreterOutput | null {
  const isValidSwipe = gestureUtils.isSwipeableDescriptor(current.gesture.desc, ctx.intentAxis)

  //used for cancel if descriptor changes
  const originalDesc = current.gesture.desc

  if (isValidSwipe) {
    current.state.phase = 'SWIPING'
    current.state.last = point
  } else {
    const newDesc = domQuery.findLaneInDom(x, y, ctx.intentAxis, current.pointerId)
    if (!newDesc) return null

    gestures[current.pointerId] = {
      pointerId: current.pointerId,
      state: {
        phase: 'SWIPING',
        start: current.state.start,
        last: point,
        totalDelta: { x: 0, y: 0 },
      },
      gesture: {
        desc: newDesc,
        computed: null
      }
    }
  }

  const session = gestures[current.pointerId]
  if (!session) return null

  const { gesture: g } = session

  const cancel = originalDesc.capabilities.pressable
    && !isValidSwipe && g.desc !== originalDesc
    ? { element: originalDesc.base.element, pressCancel: true }
    : undefined


  return {
    desc: g.desc,
    computed: g.computed,
    runtime: {
      event: 'swipeStart',
      delta: { x, y },
      cancel,
      thresholdValue: ctx.thresholdValue
    }
  }
}

/* ---------------------------
   Active swipe
----------------------------- */
function handleSwipeMove(point: Vec2, pointerId: number): InterpreterOutput | null {

  const newCurrent = gestures[pointerId]
  if (!newCurrent) return null

  const { state, gesture: g } = newCurrent

  const deltaX = point.x - state.last.x
  const deltaY = point.y - state.last.y

  state.totalDelta.x += deltaX
  state.totalDelta.y += deltaY

  state.last.x = point.x
  state.last.y = point.y



  return {
    desc: g.desc,
    computed: g.computed, //TODO find a way to ensure that it is there for slider and scroll.
    runtime: {
      event: 'swipe',
      delta: state.totalDelta,
      cancel: undefined
    }
  }
}

function onUp(_x: number, _y: number, pointerId: number): InterpreterOutput | null {
  const current = gestures[pointerId]
  if (!current) return null
  const state = current.state
  if (state.phase === 'SWIPING') return finalizeGesture(current, 'swipeCommit')
  if (state.phase === 'PENDING') return finalizeGesture(current, 'pressRelease')

  delete gestures[current.pointerId]
  log('init', 'gesture.phase error:', state.phase)
  return null
}

function finalizeGesture(current: GestureSession, event: EventType): InterpreterOutput | null {
  const { state, gesture: g } = current
  if (event === 'pressRelease' && !g.desc.capabilities.pressable) {
    delete gestures[current.pointerId]
    return null
  }
  if (event === 'swipeCommit' && !g.desc.capabilities.swipeable) {
    delete gestures[current.pointerId]
    return null
  }
  delete gestures[current.pointerId]
  return {
    desc: g.desc,
    computed: g.computed,
    runtime: {
      event: event,
      delta: state.totalDelta
    }
  }
}