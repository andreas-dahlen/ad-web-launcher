import { log, drawDots } from '../../debug/functions'
import { intentForward } from '../reactions/delegator'
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
    target: null
}

export const intentDeriver = {
    onDown,
    onMove,
    onUp
}

function onDown(x, y) {
    drawDots(x, y, 'green')
    // console.log(x, y)
    state.phase = 'PENDING'
    state.start.x = x
    state.start.y = y
    state.last.x = x
    state.last.y = y
    state.totalDelta.x = 0
    state.totalDelta.y = 0
    state.target = utils.resolveTarget(x, y)

    if (utils.resolveSupports('press', state.target)) {
        intentForward({
            type: 'press',
            target: state.target,
            delta: { x: x, y: y }
        })
    }
}

function onMove(x, y) {
    if (state.phase === 'IDLE') return
    drawDots(x, y, 'yellow')
    // console.log(x, y)


    // Compute deltas
    const startDeltaX = x - (state.start.x)
    const startDeltaY = y - (state.start.y)
    const absX = Math.abs(startDeltaX)
    const absY = Math.abs(startDeltaY)
    const biggest = absX > absY ? absX : absY
    if (state.phase === 'PENDING') {
        if (utils.swipeThresholdCalc(biggest)) {
            const intentAxis = absX > absY ? 'horizontal' : 'vertical'
            const resolved = utils.resolveSwipeTarget(x, y, intentAxis, state.target)
            
            if (resolved) {
            intentForward({
                type: 'swipeStart',
                target: resolved.target,
                delta: utils.resolveDelta({ x, y }, resolved.axis, resolved.target.swipeType),
                axis: resolved.axis,
                pressCancel: resolved.pressCancel
                    ? state.target
                    : null
            })
                state.phase = 'SWIPING'
                state.target = resolved.target
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

        const resolvedDelta = utils.resolveDelta(state.totalDelta, state.target.axis, state.target.swipeType)

        intentForward({
            type: 'swipe',
            target: state.target,
            delta: utils.normalizedDelta(resolvedDelta),
            axis: state.target.axis
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
        const resolvedDelta = utils.resolveDelta(state.totalDelta, state.target.axis, state.target.swipeType)
        intentForward({
            type: 'swipeCommit',
            target: state.target,
            delta: utils.normalizedDelta(resolvedDelta),
            axis: state.target.axis
        })
    }
    else if (state.phase === 'PENDING') {
        // Pointer up without swipe → release
        intentForward({
            type: 'pressRelease',
            target: state.target,
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
    state.target = null
}