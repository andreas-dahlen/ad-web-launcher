import { carouselStateFn } from './carouselState'
import { sliderStateFn } from './sliderState'
import { dragStateFn } from './dragState'

const stateFiles = {
    carousel: carouselStateFn,
    slider: sliderStateFn,
    drag: dragStateFn
}
function call(type, fnName, ...args) {
    return stateFiles[type]?.[fnName]?.(...args) ?? null
}
/**
 * Calculate the target offset for a commit animation
 * @param {number} position - number //slider 
 * | {x: number, y: number} //drag
 * |null //carousel
 * @param {number} constraints - {min: number, max: number} //slider
 * | {minX, maxX, minY, maxY} //drag
 * | null //carousel
 */
export const state = {
    // ----- METADATA READS ----- (for buildPayload.js)
    getSize(type, laneId) { return call(type, 'getSize', laneId) },
    getThumbSize(type, laneId) { return call(type, 'getThumbSize', laneId)},
    getPosition(type, laneId) { return call(type, 'getPosition', laneId) },
    getConstraints(type, laneId) { return call(type, 'getConstraints', laneId) },

    // ----- PURE READ ----- (for vue components and for importing reacting with the registered element)
    get(type, laneId) {
        return call(type, 'get', laneId)
    },

    // ----- EFFECTFUL WRITES ----- (by vue components)
    ensure(type, laneId) { return call(type, 'ensure', laneId) },
    setCount(type, laneId, length) { return call(type, 'setCount', laneId, length) },
    setSize(type, laneId, value) { return call(type, 'setSize', laneId, value) },
    setThumbSize(type, laneId, value) { return call(type, 'setThumbSize', laneId, value)},
    setPosition(type, laneId, position) { return call(type, 'setPosition', laneId, position) },
    setConstraints(type, laneId, constraints) { return call(type, 'setConstraints', laneId, constraints) },

    // ----- SOLVER MUTATIONS -----
    swipeStart(type, desc) { return call(type, 'swipeStart', desc) },
    swipe(type, desc) { return call(type, 'swipe', desc) },
    swipeCommit(type, desc) { return call(type, 'swipeCommit', desc) },
    swipeRevert(type, desc) { return call(type, 'swipeRevert', desc) }
}