import { carouselStateFn } from './carouselState.ts'
import { sliderStateFn } from './sliderState.ts'
import { dragStateFn } from './dragState.ts'
import type { Descriptor, Vec2, DataKeys, StateFnName, DragData } from '../../types/gestures.ts'
import { isGestureType } from '../../utils/gestureTypeGuards.ts'

type StateFn = (type: DataKeys, desc: Descriptor) => unknown

const stateFiles: Record<DataKeys, Record<string, StateFn>> = {
    carousel: carouselStateFn,
    slider: sliderStateFn,
    drag: dragStateFn,
}

function call(type: DataKeys, fnName: StateFnName, ...args: unknown[]): unknown {

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
    getSize(type: DataKeys, id: string) { return call(type, 'getSize', id) },
    getThumbSize(type: DataKeys, id: string) { return call(type, 'getThumbSize', id)},
    getPosition(type: DataKeys, id: string) { return call(type, 'getPosition', id) },
    getConstraints(type: DataKeys, id: string) { return call(type, 'getConstraints', id) },
    getCurrentIndex(type: DataKeys, id: string) { return call(type, 'getCurrentIndex', id) },

    // ----- PURE READ ----- (for vue components and for importing reacting with the registered element)
    get(type: DataKeys, id: string) { return call(type, 'get', id) },

    // ----- EFFECTFUL WRITES ----- (by vue components)
    ensure(type: DataKeys, id: string) { return call(type, 'ensure', id) },
    setCount(type: DataKeys, id: string, length: number) { return call(type, 'setCount', id, length) },
    setSize(type: DataKeys, id: string, value: Vec2) { return call(type, 'setSize', id, value) },
    setThumbSize(type: DataKeys, id: string, value: Vec2) { return call(type, 'setThumbSize', id, value)},
    setPosition(type: DataKeys, id: string, position: Vec2 | number | null) { return call(type, 'setPosition', id, position) },
    setConstraints(type: DataKeys, id: string, constraints: Vec2 | DragData['constraints']) { return call(type, 'setConstraints', id, constraints) },

    // ----- SOLVER MUTATIONS -----

    //could seperate into its own thing... since TS is complaining about arguments being 2...

    press(type: DataKeys, desc: Descriptor) { return call(type, 'press', desc)},
    swipeStart(type: DataKeys, desc: Descriptor) { return call(type, 'swipeStart', desc) },
    swipe(type: DataKeys, desc: Descriptor) { return call(type, 'swipe', desc) },
    swipeCommit(type: DataKeys, desc: Descriptor) { return call(type, 'swipeCommit', desc) },
    swipeRevert(type: DataKeys, desc: Descriptor) { return call(type, 'swipeRevert', desc) }
}