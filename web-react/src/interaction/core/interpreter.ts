import { log, drawDots } from '../../app/debug/functions.ts'
import type { Descriptor, Axis, Vec2, CancelData, GestureUpdate } from '../../types/gestures.ts'
import { utils } from './intentUtils.ts'

/* =========================================================
   Gesture state
========================================================= */

interface GestureState {
    phase: 'IDLE' | 'PENDING' | 'SWIPING'
    start: Vec2
    last: Vec2
    totalDelta: Vec2
    desc?: Descriptor
}
const gesture: GestureState = {
    phase: 'IDLE',
    start: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    totalDelta: { x: 0, y: 0 }
}

/* =========================================================
   Public API
========================================================= */
export const interpreter = {
    onDown,
    onMove,
    onUp,
    resetGesture,
    applyGestureUpdate
}
function applyGestureUpdate(update: GestureUpdate) {
    if (!gesture.desc) return
    gesture.desc.runtime = {
        ...gesture.desc.runtime,
        ...update
    }
}
/* =========================================================
   Helpers
========================================================= */

function resetGesture() {
    gesture.phase = 'IDLE'
    gesture.start.x = 0
    gesture.start.y = 0
    gesture.last.x = 0
    gesture.last.y = 0
    gesture.totalDelta.x = 0
    gesture.totalDelta.y = 0
    gesture.desc = undefined
}

/* =========================================================
   Event handlers
========================================================= */

function onDown(x: number, y: number): Descriptor | null {
    drawDots(x, y, 'green')
    gesture.phase = 'PENDING'
    gesture.start.x = x
    gesture.start.y = y
    gesture.last.x = x
    gesture.last.y = y
    gesture.totalDelta.x = 0
    gesture.totalDelta.y = 0
    gesture.desc = undefined

    const resolved = utils.resolveTarget(x, y)
    if (!resolved) return null
    gesture.desc = resolved.desc
    // if(gesture.desc?.startOffset) gesture.desc.startOffset = resolved.offset
    if (utils.resolveSupports('pressable', gesture.desc)) {
        gesture.desc.runtime = {
            ...gesture.desc.runtime,
            event: 'press',
            delta: { x, y }
        }
        return gesture.desc
    }
    return null
}

function onMove(x: number, y: number): Descriptor | null {
    if (gesture.phase === 'IDLE') return null
    drawDots(x, y, 'yellow')
    const absX = Math.abs(x - gesture.start.x)
    const absY = Math.abs(y - gesture.start.y)
    const biggest = Math.max(absX, absY)
    /* -------------------------------------------------------
       Pending → swipe start
    ------------------------------------------------------- */

    if (gesture.phase === 'PENDING') {
        if (!gesture.desc) return null
        if (!utils.swipeThresholdCalc(biggest, gesture.desc)) return null
        const intentAxis: Axis = absX > absY ? 'horizontal' : 'vertical'
        const resolved = utils.resolveSwipeTarget(x, y, intentAxis, gesture.desc)

        if (!resolved) return null
        const cancel: CancelData | undefined = resolved.pressCancel
            ? { element: gesture.desc.base.element, pressCancel: true }
            : undefined

        gesture.phase = 'SWIPING'
        gesture.desc = resolved.desc
        gesture.last.x = x
        gesture.last.y = y

        gesture.desc.runtime = {
            ...gesture.desc.runtime,
            event: 'swipeStart',
            delta: { x, y },
            cancel
        }
        return gesture.desc
    }

    /* -------------------------------------------------------
       Active swipe
    ------------------------------------------------------- */

    if (gesture.phase === 'SWIPING' && gesture.desc) {

        const deltaX = x - gesture.last.x
        const deltaY = y - gesture.last.y
        gesture.totalDelta.x += deltaX
        gesture.totalDelta.y += deltaY
        gesture.last.x = x
        gesture.last.y = y

        gesture.desc.runtime = {
            ...gesture.desc.runtime,
            event: 'swipe',
            delta: utils.normalizedDelta(gesture.totalDelta)
        }
        return gesture.desc
    }
    return null
}

function onUp(x: number, y: number): Descriptor | null {
    if (gesture.phase !== 'SWIPING' && gesture.phase !== 'PENDING') {
        log('init', 'gesture.phase error:', gesture.phase)
        return null
    }
    /* -------------------------------------------------------
       Swipe end
    ------------------------------------------------------- */

    if (gesture.phase === 'SWIPING' && gesture.desc) {

        gesture.desc.runtime = {
            ...gesture.desc.runtime,
            event: 'swipeCommit',
            delta: utils.normalizedDelta(gesture.totalDelta)
        }
        const descriptor = gesture.desc
        resetGesture()
        return descriptor
    }

    /* -------------------------------------------------------
       Press release
    ------------------------------------------------------- */
    if (gesture.phase === 'PENDING' && gesture.desc) {

        gesture.desc.runtime = {
            ...gesture.desc?.runtime,
            event: 'pressRelease',
            delta: {x, y}
        }
        const descriptor = gesture.desc
        resetGesture()
        return descriptor
    }
    return null
}