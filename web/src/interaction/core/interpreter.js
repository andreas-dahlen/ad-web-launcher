import { log, drawDots } from '../../debug/functions'
import { utils } from './intentUtils'

/*
IntentMapper
------------
Stateful gesture interpreter.
Converts raw pointer events into semantic intents:
press, swipeStart, swipe, swipeCommit, pressRelease.

Delta semantics:
- press / release: raw {x,y}
- swipeStart: raw, axis-resolved
- swipe / commit: normalized totalDelta
*/

// Gesture state (no DOM refs)
const state = {
    phase: 'IDLE',            // gesture lifecycle
    start: { x: 0, y: 0 },    // initial pointer down
    last: { x: 0, y: 0 },     // last pointer position
    totalDelta: { x: 0, y: 0 }, // accumulated delta
    targetInfo: null,
    lockedAxis: 'both'
}

export const interpreter = {
    onDown,
    onMove,
    onUp,
    resetGesture
}

function onDown(x, y) {
    drawDots(x, y, 'green')
    state.phase = 'PENDING'
    state.start.x = x
    state.start.y = y
    state.last.x = x
    state.last.y = y
    state.totalDelta.x = 0
    state.totalDelta.y = 0
    //element is already resolved.. should only check if supported
    state.targetInfo = utils.resolveTarget(x, y)
    if (utils.resolveSupports('press', state.targetInfo)) {
        return {
            ...state.targetInfo,
            type: 'press',
            delta: { x: x, y: y }
        }
    }
    return null
}

function onMove(x, y) {
    if (state.phase === 'IDLE') return null
    drawDots(x, y, 'yellow')

    // Compute deltas
    const absX = Math.abs(x - state.start.x)
    const absY = Math.abs(y - state.start.y)
    const biggest = Math.max(absX, absY)

    if (state.phase === 'PENDING') {
        if (!utils.swipeThresholdCalc(biggest)) return null
        const intentAxis = absX > absY ? 'horizontal' : 'vertical'
        const resolved = utils.resolveSwipeTarget(x, y, intentAxis, state.targetInfo)
        if (resolved) {
            let cancel = null
            state.lockedAxis = resolved.lockedAxis
            if (resolved.pressCancel) {
                cancel = {
                    ...state.targetInfo,
                    type: 'pressCancel',
                    delta: { x: x, y: y }
                }
            }
            state.phase = 'SWIPING'
            state.targetInfo = resolved.targetInfo
            return {
                ...state.targetInfo,
                type: 'swipeStart',
                delta: {x: x, y: y },
                extra: cancel
            }
        }
    }
    // Track swipe delta
    if (state.phase === 'SWIPING') {

        const deltaX = x - state.last.x
        const deltaY = y - state.last.y

        state.totalDelta.x += deltaX
        state.totalDelta.y += deltaY

        state.last.x = x
        state.last.y = y

        return {
            ...state.targetInfo,
            type: 'swipe',
            delta: utils.normalizedDelta(state.totalDelta),
        }
    }
    return null
}


function onUp(x, y) {
    if (state.phase !== 'SWIPING' && state.phase !== 'PENDING') {
        log('init', 'state.phase error: ', state.phase)
        return null
    }
    if (state.phase === 'SWIPING') {
        return {
            ...state.targetInfo,
            type: 'swipeCommit',
            delta: utils.normalizedDelta(state.totalDelta),
        }
    }
    else if (state.phase === 'PENDING') {
        // Pointer up without swipe → release
        return {
            ...state.targetInfo,
            type: 'pressRelease',
            delta: { x: x, y: y }
        }
    }
    return null
}

// Helper: reset all gesture state
function resetGesture() {
    state.phase = 'IDLE'
    state.start.x = 0
    state.start.y = 0
    state.last.x = 0
    state.last.y = 0
    state.totalDelta.x = 0
    state.totalDelta.y = 0
    state.targetInfo = null
    state.lockedAxis = 'both'
}