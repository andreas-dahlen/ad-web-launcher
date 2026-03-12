import { log, drawDots } from '../../app/debug/functions'
import type { Descriptor, Axis } from '../../types/gestures'
import { utils } from './intentUtils'

/* =========================================================
   Gesture state
========================================================= */

interface GestureState {
    phase: 'IDLE' | 'PENDING' | 'SWIPING'
    start: { x: number; y: number }
    last: { x: number; y: number }
    totalDelta: { x: number; y: number }
    desc?: Descriptor
}
const gesture: GestureState = {
    phase: 'IDLE',
    start: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    totalDelta: { x: 0, y: 0 },
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
function applyGestureUpdate(update: Partial<Descriptor>) {
    if (!gesture.desc) return

    gesture.desc = {
        ...gesture.desc,
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

    const resolved = utils.resolveTarget(x, y)
    if (!resolved) return null
    gesture.desc = resolved.desc
    // if(gesture.desc?.startOffset) gesture.desc.startOffset = resolved.offset
    if (utils.resolveSupports('pressable', gesture.desc)) {
        return gesture.desc ? {
            ...gesture.desc,
            event: 'press',
            delta: { x, y },
            startOffset: resolved.offset
        }
            : null
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
        let cancel: { element: HTMLElement; pressCancel: boolean } | undefined
        if (resolved.pressCancel) {
            cancel = {
                element: gesture.desc.element,
                pressCancel: true
            }
        }

        gesture.phase = 'SWIPING'
        gesture.desc = resolved.desc
        gesture.last.x = x
        gesture.last.y = y

        return gesture.desc ? {
            ...gesture.desc,
            event: 'swipeStart',
            delta: { x, y },
            cancel,
            startOffset: resolved.offset
        }
            : null
    }

    /* -------------------------------------------------------
       Active swipe
    ------------------------------------------------------- */

    if (gesture.phase === 'SWIPING') {

        const deltaX = x - gesture.last.x
        const deltaY = y - gesture.last.y
        gesture.totalDelta.x += deltaX
        gesture.totalDelta.y += deltaY
        gesture.last.x = x
        gesture.last.y = y

        return gesture.desc ? {
            ...gesture.desc,
            event: 'swipe',
            delta: utils.normalizedDelta(gesture.totalDelta)
        }
            : null
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

    if (gesture.phase === 'SWIPING') {
        const descriptor = {
            ...gesture.desc,
            event: 'swipeCommit',
            delta: utils.normalizedDelta(gesture.totalDelta)
        }
        resetGesture()
        return descriptor as Descriptor
    }

    /* -------------------------------------------------------
       Press release
    ------------------------------------------------------- */
    if (gesture.phase === 'PENDING') {
        const descriptor =  {
            ...gesture.desc,
            event: 'pressRelease',
            delta: { x, y }
        }
        resetGesture()
        return descriptor as Descriptor
    }
    return null
}