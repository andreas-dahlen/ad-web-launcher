import { log } from '../../test/functions.ts'
import { gestureUtils } from './gestureUtils.ts'
import { domQuery } from './domQuery.ts'
import type { Axis, EventType, Vec2 } from '../../shared/typing/core.types.ts'
import type { Descriptor } from '../types/descriptor.types.ts'
import type { GestureUpdate } from '../types/data.types.ts'

/* ========================
   Gesture state
=========================== */
type GestureMap = Partial<Record<number, GestureState>>
const gestures: GestureMap = {}

interface GestureState {
  pointerId: number
  phase: 'PENDING' | 'SWIPING'
  start: Vec2
  last: Vec2
  totalDelta: Vec2
  desc: Descriptor
}
/* ========================
   Public API
=========================== */
export const interpreter = {
  onDown,
  onMove,
  onUp,
  applyGestureUpdate,
  deleteGesture
}

function applyGestureUpdate(update: GestureUpdate) {
  const g = gestures[update.pointerId]
  if (!g) return
  switch (g.desc.type) {
    case 'slider': {
      g.desc.ctx.gestureUpdate = {
        ...g.desc.ctx.gestureUpdate,
        ...update,
      }
      break
    }
    case 'scroll': {
      g.desc.ctx.gestureUpdate = {
        ...g.desc.ctx.gestureUpdate,
        ...update,
      }
      break
    }
  }
}

function deleteGesture(pointerId: number) {
  delete gestures[pointerId]
  return null
}

/* =====================
   Event handlers
======================== */
function onDown(x: number, y: number, pointerId: number): Descriptor | null {
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
    start: gestureUtils.normalizeVec2({ x, y }),
    last: gestureUtils.normalizeVec2({ x, y }),
    totalDelta: { x: 0, y: 0 },
    desc: resolved

  }
  const g = gestures[pointerId]

  if (g.desc.capabilities.pressable) {
    return g.desc
  }
  return null
}

function onMove(x: number, y: number, pointerId: number): Descriptor | null {
  const g = gestures[pointerId]
  if (!g) return null
  const point = gestureUtils.normalizeVec2({ x, y })
  const absX = Math.abs(point.x - g.start.x)
  const absY = Math.abs(point.y - g.start.y)
  const biggest = Math.max(absX, absY)
  /* -----------------------------------
     Pending → swipe start
  ------------------------------------- */

  if (g.phase === 'PENDING') {
    if (!g.desc) return null
    if (!gestureUtils.swipeThresholdCalc(biggest, g.desc.capabilities.instantSwipe)) return null
    const intentAxis: Axis = absX > absY ? 'horizontal' : 'vertical'

    const resolved = gestureUtils.isSwipeableDescriptor(g.desc, intentAxis)
      ? g.desc
      : domQuery.findLaneInDom(x, y, intentAxis, g.desc.base.pointerId)

    //FUTURE return pressCancel if unresolved 
    if (!resolved) return null
    const thresholdValue = { x: point.x - g.last.x, y: point.y - g.last.y }

    g.phase = 'SWIPING'
    g.last.x = point.x
    g.last.y = point.y

    const cancel = g.desc.capabilities.pressable
      && resolved !== g.desc
      ? { element: g.desc.base.element, pressCancel: true }
      : undefined

    g.desc = resolved
    g.desc.ctx.cancel = cancel
    g.desc.ctx.event = 'swipeStart'
    g.desc.ctx.thresholdValue = thresholdValue
    return g.desc
  }

  /* ---------------------------
     Active swipe
  ----------------------------- */
  if (g.phase === 'SWIPING' && g.desc) {

    const deltaX = point.x - g.last.x
    const deltaY = point.y - g.last.y

    g.totalDelta.x += deltaX
    g.totalDelta.y += deltaY

    g.last.x = point.x
    g.last.y = point.y

    if (g.desc.type !== 'button') {
      g.desc.ctx.delta = g.totalDelta
      g.desc.ctx.cancel = undefined
      g.desc.ctx.event = 'swipe'
      return g.desc
    }
  }
  return null
}

function onUp(_x: number, _y: number, pointerId: number): Descriptor | null {
  const g = gestures[pointerId]
  if (!g) return null

  if (g.phase === 'SWIPING') return finalizeGesture(g, 'swipeCommit')
  if (g.phase === 'PENDING') return finalizeGesture(g, 'pressRelease')

  delete gestures[g.pointerId]
  log('init', 'gesture.phase error:', g.phase)
  return null
}

function finalizeGesture(g: GestureState, event: EventType): Descriptor | null {
  if (event === 'pressRelease' && !g.desc.capabilities.pressable) {
    delete gestures[g.pointerId]
    return null
  }
  if (event === 'swipeCommit' && !g.desc.capabilities.swipeable) {
    delete gestures[g.pointerId]
    return null
  }
  g.desc.ctx.event = event
  const descriptor = g.desc
  delete gestures[g.pointerId]
  return descriptor
}