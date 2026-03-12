import { carouselStateFn } from './carouselState.ts'
import { sliderStateFn } from './sliderState.ts'
import { dragStateFn } from './dragState.ts'
import type { Descriptor, Vec2, SwipeType, StateFnName } from '../../types/gestures.ts'

type StateFn = (type: SwipeType, desc: Descriptor) => unknown
const stateFiles: Record<SwipeType, Record<string, StateFn>> = {
    carousel: carouselStateFn,
    slider: sliderStateFn,
    drag: dragStateFn,
}

function call(type: SwipeType, fnName: StateFnName, ...args: unknown[]): unknown {
    return stateFiles[type]?.[fnName]?.(...args) ?? null
}
// /**
//  * Calculate the target offset for a commit animation
//  * @param {number} position - number //slider 
//  * | {x: number, y: number} //drag
//  * |null //carousel
//  * @param {number} constraints - {min: number, max: number} //slider
//  * | {minX, maxX, minY, maxY} //drag
//  * | null //carousel
//  */
export const state = {
    // ----- METADATA READS ----- (for buildPayload.js)
    getSize(type: SwipeType, id: string) { return call(type, 'getSize', id) },
    getThumbSize(type: SwipeType, id: string) { return call(type, 'getThumbSize', id)},
    getPosition(type: SwipeType, id: string) { return call(type, 'getPosition', id) },
    getConstraints(type: SwipeType, id: string) { return call(type, 'getConstraints', id) },
    getCurrentIndex(type: SwipeType, id: string) { return call(type, 'getCurrentIndex', id) },

    // ----- PURE READ ----- (for vue components and for importing reacting with the registered element)
    get(type: SwipeType, id: string) { return call(type, 'get', id) },

    // ----- EFFECTFUL WRITES ----- (by vue components)
    ensure(type: SwipeType, id: string) { return call(type, 'ensure', id) },
    setCount(type: SwipeType, id: string, length: number) { return call(type, 'setCount', id, length) },
    setSize(type: SwipeType, id: string, value: Vec2) { return call(type, 'setSize', id, value) },
    setThumbSize(type: SwipeType, id: string, value: Vec2) { return call(type, 'setThumbSize', id, value)},
    setPosition(type: SwipeType, id: string, position: Vec2 | number | null) { return call(type, 'setPosition', id, position) },
    setConstraints(type: SwipeType, id: string, constraints: unknown) { return call(type, 'setConstraints', id, constraints) },

    // ----- SOLVER MUTATIONS -----
    press(type: SwipeType, desc: Descriptor) { return call(type, 'press', desc)},
    swipeStart(type: SwipeType, desc: Descriptor) { return call(type, 'swipeStart', desc) },
    swipe(type: SwipeType, desc: Descriptor) { return call(type, 'swipe', desc) },
    swipeCommit(type: SwipeType, desc: Descriptor) { return call(type, 'swipeCommit', desc) },
    swipeRevert(type: SwipeType, desc: Descriptor) { return call(type, 'swipeRevert', desc) }
}