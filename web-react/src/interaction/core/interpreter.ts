import { log } from '@debug/functions.ts'
import { gestureUtils } from './gestureUtils.ts'
import { domQuery } from './domQuery.ts'
import type { Axis, EventType, Vec2 } from '../../typeScript/core/primitiveType.ts'
import type { Descriptor } from '../../typeScript/descriptor/descriptor.ts'
import type { GestureUpdate } from '../../typeScript/descriptor/dataType.ts'

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
    start: { x: x, y: y },
    last: { x: x, y: y },
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
  const absX = Math.abs(x - g.start.x)
  const absY = Math.abs(y - g.start.y)
  const biggest = Math.max(absX, absY)
  /* -----------------------------------
     Pending → swipe start
  ------------------------------------- */

  if (g.phase === 'PENDING') {
    if (!g.desc) return null
    if (!gestureUtils.swipeThresholdCalc(biggest, g.desc.type)) return null
    const intentAxis: Axis = absX > absY ? 'horizontal' : 'vertical'

    const resolved = gestureUtils.isSwipeableDescriptor(g.desc, intentAxis)
      ? g.desc
      : domQuery.findLaneInDom(x, y, intentAxis, g.desc.base.pointerId)

    //FUTURE return pressCancel if unresolved 
    if (!resolved) return null

    g.phase = 'SWIPING'
    g.last.x = x
    g.last.y = y

    const cancel = g.desc.capabilities.pressable
      && resolved !== g.desc
      ? { element: g.desc.base.element, pressCancel: true }
      : undefined

    g.desc = resolved
    g.desc.ctx.cancel = cancel
    g.desc.ctx.event = 'swipeStart'
    return g.desc
  }

  /* ---------------------------
     Active swipe
  ----------------------------- */
  if (g.phase === 'SWIPING' && g.desc) {

    const deltaX = x - g.last.x
    const deltaY = y - g.last.y

    g.totalDelta.x += deltaX
    g.totalDelta.y += deltaY

    g.last.x = x
    g.last.y = y

    if (g.desc.type !== 'button') {
      g.desc.ctx.delta = gestureUtils.normalizedDelta(g.totalDelta) ?? g.desc.ctx.delta
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