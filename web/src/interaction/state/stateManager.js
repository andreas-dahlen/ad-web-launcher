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
    getSize(type, id) { return call(type, 'getSize', id) },
    getThumbSize(type, id) { return call(type, 'getThumbSize', id)},
    getPosition(type, id) { return call(type, 'getPosition', id) },
    getConstraints(type, id) { return call(type, 'getConstraints', id) },
    getCurrentIndex(type, id) { return call(type, 'getCurrentIndex', id) },

    // ----- PURE READ ----- (for vue components and for importing reacting with the registered element)
    get(type, id) { return call(type, 'get', id) },

    // ----- EFFECTFUL WRITES ----- (by vue components)
    ensure(type, id) { return call(type, 'ensure', id) },
    setCount(type, id, length) { return call(type, 'setCount', id, length) },
    setSize(type, id, value) { return call(type, 'setSize', id, value) },
    setThumbSize(type, id, value) { return call(type, 'setThumbSize', id, value)},
    setPosition(type, id, position) { return call(type, 'setPosition', id, position) },
    setConstraints(type, id, constraints) { return call(type, 'setConstraints', id, constraints) },

    // ----- SOLVER MUTATIONS -----
    swipeStart(type, desc) { return call(type, 'swipeStart', desc) },
    swipe(type, desc) { return call(type, 'swipe', desc) },
    swipeCommit(type, desc) { return call(type, 'swipeCommit', desc) },
    swipeRevert(type, desc) { return call(type, 'swipeRevert', desc) }
}