import { log } from '@debug/functions.ts'
import { utils } from './intentUtils.ts'

import type { Axis, EventType, Vec2 } from '@interaction/types/primitiveType.ts'
import type { Descriptor } from '@interaction/types/descriptor/descriptor.ts'
import type { GestureUpdate } from '@interaction/types/descriptor/dataType.ts'
import { domQuery } from '@interaction/core/domQuery.ts'

/* ========================
   Gesture state
=========================== */

type GestureMap = Record<number, GestureState>
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

  if (utils.resolveSupports('pressable', g.desc)) {
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
    if (!utils.swipeThresholdCalc(biggest, g.desc)) return null
    const intentAxis: Axis = absX > absY ? 'horizontal' : 'vertical'
    const resolved = utils.resolveSwipeStart(x, y, intentAxis, g.desc)

    //future me -> probably return pressCancel if resolved is false... and possibly delete gesture... 
    if (!resolved) return null

    g.phase = 'SWIPING'
    g.last.x = x
    g.last.y = y
    g.desc.ctx.cancel = resolved.pressCancel
      ? { element: g.desc.base.element, pressCancel: true }
      : undefined
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
      g.desc.ctx.delta = utils.normalizedDelta(g.totalDelta) ?? g.desc.ctx.delta
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
  if (event === 'pressRelease' && !utils.resolveSupports('pressable', g.desc)) {
    delete gestures[g.pointerId]
    return null
  }
  if (event === 'swipeCommit' && !utils.resolveSupports('swipeable', g.desc)) {
    delete gestures[g.pointerId]
    return null
  }

  g.desc.ctx.event = event
  const descriptor = g.desc
  delete gestures[g.pointerId]
  return descriptor
}