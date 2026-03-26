import { log } from '@debug/functions.ts'
import { utils } from './intentUtils.ts'

import type { Axis, Vec2 } from '@interaction/types/primitives.ts'
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
    const { pointerId, ...runtimeUpdate } = update
    const g = gestures[pointerId]

    if (!g || !g.desc) return
    g.desc.runtime.gestureUpdate = {
        ...g.desc.runtime.gestureUpdate,
        ...runtimeUpdate
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

    // const resolved = utils.resolveTarget(x, y, pointerId)
    if (!resolved) return null
    const g = gestures[pointerId]

    if (utils.resolveSupports('pressable', g.desc)) {
        // g.desc.runtime = {
        //     ...g.desc.runtime,
        //     // event: 'press',
        //     delta: { x, y }
        // }
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

        if (!resolved) return null
        const cancel: CancelData | undefined = resolved.pressCancel
            ? { element: g.desc.base.element, pressCancel: true }
            : undefined

        g.phase = 'SWIPING'
        g.desc = resolved.desc
        g.last.x = x
        g.last.y = y

        g.desc.runtime = {
            ...g.desc.runtime,
            // event: 'swipeStart',
            // delta: { x, y },
            cancel
        }
        return g.desc
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

        // g.desc.runtime = {
        //     ...g.desc.runtime,
        //     // event: 'swipe',
        //     // delta: utils.normalizedDelta(g.totalDelta)
        // }
        return g.desc
    }
    return null
}

function onUp(x: number, y: number, pointerId: number): Descriptor | null {
    const g = gestures[pointerId]
    if (!g) return null
    if (g.phase !== 'SWIPING' && g.phase !== 'PENDING') {
        log('init', 'gesture.phase error:', g.phase)
        return null
    }
    /* -------------------------------------------------------
       Swipe end
    ------------------------------------------------------- */

    if (g.phase === 'SWIPING' && g.desc) {

        // g.desc.runtime = {
        //     ...g.desc.runtime,
        //     // event: 'swipeCommit',
        //     // delta: utils.normalizedDelta(g.totalDelta)
        // }
        const descriptor = g.desc
        delete gestures[pointerId]
        return descriptor
    }

    /* -------------------------------------------------------
       Press release
    ------------------------------------------------------- */
    if (g.phase === 'PENDING' && g.desc) {

        // g.desc.runtime = {
            // ...g.desc?.runtime,
            // event: 'pressRelease',
            // delta: { x, y }
        // }
        const descriptor = g.desc
        delete gestures[pointerId]
        return descriptor
    }
    return null
}