import { log, drawDots } from '../../debug/functions'
import { utils } from './intentUtils'

/*
IntentMapper
------------
Stateful gesture interpreter.
Converts raw pointer events into semantic intents:
press, swipeStart, swipe, swipeCommit, pressRelease.

Delta semantics:
- press / release / swipeStart: raw {x,y}
- swipe / commit: normalized totalDelta
*/

// Gesture state (no DOM refs)
const gesture = {
    phase: 'IDLE',            // gesture lifecycle
    start: { x: 0, y: 0 },    // initial pointer down
    last: { x: 0, y: 0 },     // last pointer position
    totalDelta: { x: 0, y: 0 }, // accumulated delta
    desc: null, // targetResolvers descriptor
}

export const interpreter = {
    onDown,
    onMove,
    onUp,
    resetGesture,
    applyGestureUpdate
}
function applyGestureUpdate(update) {
    gesture.desc = {
        ...gesture.desc,
        ...update
    }
}

// Helper: reset all gesture
function resetGesture() {
    gesture.phase = 'IDLE'
    gesture.start.x = 0
    gesture.start.y = 0
    gesture.last.x = 0
    gesture.last.y = 0
    gesture.totalDelta.x = 0
    gesture.totalDelta.y = 0
    gesture.desc = null
}

function onDown(x, y) {
    drawDots(x, y, 'green')
    gesture.phase = 'PENDING'
    gesture.start.x = x
    gesture.start.y = y
    gesture.last.x = x
    gesture.last.y = y
    gesture.totalDelta.x = 0
    gesture.totalDelta.y = 0

    gesture.desc = utils.resolveTarget(x, y)
    if (utils.resolveSupports('press', gesture.desc)) {
        return {
            ...gesture.desc,
            type: 'press',
            delta: { x: x, y: y }
        }
    }
    return null
}

function onMove(x, y) {
    if (gesture.phase === 'IDLE') return null
    drawDots(x, y, 'yellow')
    // Compute deltas
    const absX = Math.abs(x - gesture.start.x)
    const absY = Math.abs(y - gesture.start.y)
    const biggest = Math.max(absX, absY)

    if (gesture.phase === 'PENDING') {
        if (!utils.swipeThresholdCalc(biggest)) return null
        const intentAxis = absX > absY ? 'horizontal' : 'vertical'
        const resolved = utils.resolveSwipeTarget(x, y, intentAxis, gesture.desc)
        if (resolved) {
            let cancel = null
            if (resolved.pressCancel) {
                cancel = {
                    ...gesture.desc,
                    type: 'pressCancel',
                    delta: { x: x, y: y }
                }
            }
            gesture.phase = 'SWIPING'
            gesture.desc = resolved.desc
            gesture.desc.startOffset = utils.resolveStartOffset(x, y, gesture.desc.element)
            gesture.last.x = x
            gesture.last.y = y
            return {
                ...gesture.desc,
                type: 'swipeStart',
                delta: {x: x, y: y }, //this should be same location as press?
                extra: cancel
            }
        }
    }
    // Track swipe delta
    if (gesture.phase === 'SWIPING') {

        const deltaX = x - gesture.last.x
        const deltaY = y - gesture.last.y

        gesture.totalDelta.x += deltaX
        gesture.totalDelta.y += deltaY

        gesture.last.x = x
        gesture.last.y = y

        return {
            ...gesture.desc,
            type: 'swipe',
            delta: utils.normalizedDelta(gesture.totalDelta),
        }
    }
    return null
}

function onUp(x, y) {
    if (gesture.phase !== 'SWIPING' && gesture.phase !== 'PENDING') {
        log('init', 'gesture.phase error: ', gesture.phase)
        return null
    }
    if (gesture.phase === 'SWIPING') {
        return {
            ...gesture.desc,
            type: 'swipeCommit',
            delta: utils.normalizedDelta(gesture.totalDelta),
        }
    }
    else if (gesture.phase === 'PENDING') {
        // Pointer up without swipe → release
        return {
            ...gesture.desc,
            type: 'pressRelease',
            delta: { x: x, y: y }
        }
    }
    return null
}

