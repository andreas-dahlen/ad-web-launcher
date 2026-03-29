import { log } from '@debug/functions.ts'
import { utils } from './intentUtils.ts'

import type { Axis, EventType, Vec2 } from '@interaction/types/primitives.ts'
import type { Descriptor } from '@interaction/types/descriptor.ts'
import type { GestureUpdate } from '@interaction/types/data.ts'
import type { CancelData } from '@interaction/types/base.ts'

/* =========================================================
   Gesture state
========================================================= */

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
/* =========================================================
   Public API
========================================================= */
export const interpreter = {
    onDown,
    onMove,
    onUp,
    applyGestureUpdate,
    deleteGesture
}

function applyGestureUpdate(update: GestureUpdate) {
    const g = gestures[update.pointerId]
    switch (g.desc.type) {
        case 'slider': {
            g.desc.solutions.gestureUpdate = {
                ...g.desc.solutions.gestureUpdate,
                ...update,
            }
        }
    }
}

function deleteGesture(pointerId: number) {
    delete gestures[pointerId]
}

/* =========================================================
   Event handlers
========================================================= */

function onDown(x: number, y: number, pointerId: number): Descriptor | null {
    const resolved = utils.resolveTarget(x, y, pointerId)
    if (!resolved) return null
    gestures[pointerId] = {
        pointerId: pointerId,
        phase: 'PENDING',
        start: { x: x, y: y },
        last: { x: x, y: y },
        totalDelta: { x: 0, y: 0 },
        desc: resolved.desc
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
    /* -------------------------------------------------------
       Pending → swipe start
    ------------------------------------------------------- */

    if (g.phase === 'PENDING') {
        if (!g.desc) return null
        if (!utils.swipeThresholdCalc(biggest, g.desc)) return null
        const intentAxis: Axis = absX > absY ? 'horizontal' : 'vertical'
        const resolved = utils.resolveSwipeTarget(x, y, intentAxis, g.desc)

        //future me -> probablt return pressCancel if resolved is false...
        if (!resolved) return null
        if (resolved.desc.type == 'button') return null

        const cancel: CancelData | undefined = resolved.pressCancel
            ? { element: g.desc.base.element, pressCancel: true }
            : undefined

        g.phase = 'SWIPING'
        g.desc = resolved.desc
        g.last.x = x
        g.last.y = y

        return {
            ...resolved.desc,
            cancel
        }
    }

    /* -------------------------------------------------------
       Active swipe
    ------------------------------------------------------- */

    if (g.phase === 'SWIPING' && g.desc) {

        const deltaX = x - g.last.x
        const deltaY = y - g.last.y

        g.totalDelta.x += deltaX
        g.totalDelta.y += deltaY

        g.last.x = x
        g.last.y = y

        if (g.desc.type !== 'button') {
            g.desc.base.delta = utils.normalizedDelta(g.totalDelta) ?? g.desc.base.delta
            g.desc.base.event = 'swipe'
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

    log('init', 'gesture.phase error:', g.phase)
    return null
}

function finalizeGesture(g: GestureState, event: EventType): Descriptor {
    if ('base' in g.desc && 'delta' in g.desc.base) {
        g.desc.base.event = event
    }
    const descriptor = g.desc
    delete gestures[g.pointerId]
    return descriptor
}