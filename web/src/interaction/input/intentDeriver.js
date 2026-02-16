import { log, drawDots } from '../../debug/functions'
import { forward } from '../reactions/delegator'
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
    targetInfo: null
}

export const intentDeriver = {
    onDown,
    onMove,
    onUp
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
        forward({
            ...state.targetInfo,
            type: 'press',
            delta: { x: x, y: y }
        })
    }
}

function onMove(x, y) {
    if (state.phase === 'IDLE') return
    drawDots(x, y, 'yellow')

    // Compute deltas
    const deltaX = x - (state.start.x)
    const deltaY = y - (state.start.y)
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    const biggest = Math.max(absX, absY)

    if (state.phase === 'PENDING') {
        if (utils.swipeThresholdCalc(biggest)) {
            const intentAxis = absX > absY ? 'horizontal' : 'vertical'
            const resolved = utils.resolveSwipeTarget(x, y, intentAxis, state.targetInfo)
            if (resolved) {
                if (resolved.pressCancel) {
                    forward({
                        ...state.targetInfo,
                        type: 'pressCancel',
                        delta: {x: x, y: y}
                    })
                }
                state.phase = 'SWIPING'
                state.targetInfo = resolved.targetInfo
                forward({
                    ...state.targetInfo,
                    type: 'swipeStart',
                    delta: utils.resolveDelta({ x, y }, state.targetInfo.axis, state.targetInfo.swipeType)
                })
            } else {
                return
            }
        }
    }

    // Track swipe delta
    if (state.phase === 'SWIPING') {

        const deltaX = x - state.last.x
        const deltaY = y - state.last.y

        state.totalDelta.x += deltaX
        state.totalDelta.y += deltaY
        const resolvedDelta = utils.resolveDelta(state.totalDelta, state.targetInfo.axis, state.targetInfo.swipeType)

        forward({
            ...state.targetInfo,
            type: 'swipe',
            delta: utils.normalizedDelta(resolvedDelta),
        })
    }
    state.last.x = x
    state.last.y = y
}


function onUp(x, y) {
    if (state.phase !== 'SWIPING' && state.phase !== 'PENDING') {
        log('init', 'state.phase error: ', state.phase)
        resetState()
        return
    }
    if (state.phase === 'SWIPING') {
        const resolvedDelta = utils.resolveDelta(state.totalDelta, state.targetInfo.axis, state.targetInfo.swipeType)
        forward({
            ...state.targetInfo,
            type: 'swipeCommit',
            delta: utils.normalizedDelta(resolvedDelta),
        })
    }
    else if (state.phase === 'PENDING') {
        // Pointer up without swipe → release
        forward({
            ...state.targetInfo,
            type: 'pressRelease',
            delta: { x: x, y: y }
        })
    }
    resetState()
}

// Helper: reset all gesture state
function resetState() {
    state.phase = 'IDLE'
    state.start.x = 0
    state.start.y = 0
    state.last.x = 0
    state.last.y = 0
    state.totalDelta.x = 0
    state.totalDelta.y = 0
    state.targetInfo = null
}