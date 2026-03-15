import { carouselStateFn } from './carouselState.ts'
import { sliderStateFn } from './sliderState.ts'
import { dragStateFn } from './dragState.ts'
import type { Descriptor, Vec2, DataKeys, StateFn2Arg, StateFn3Arg, DragData } from '../../types/gestures.ts'

type StateFn2 = (type: DataKeys, descOrId: Descriptor | string) => unknown
type StateFn3 = (type: DataKeys, id: string, value: unknown) => unknown

type StateFnAny = (...args: unknown[]) => unknown

const stateFiles: Record<DataKeys, Record<string, StateFnAny>> = {
    carousel: carouselStateFn as Record<string, StateFnAny>,
    slider: sliderStateFn as Record<string, StateFnAny>,
    drag: dragStateFn as Record<string, StateFnAny>,
}
function callMutate(type: DataKeys, fnName: StateFn2Arg, desc: Descriptor) {
    const fn = stateFiles[type]?.[fnName] as StateFn2 | undefined
    return fn ? fn(type, desc) : null
}

function callGet(type: DataKeys, fnName: StateFn2Arg, id: string) {
    const fn = stateFiles[type]?.[fnName] as StateFn2 | undefined
    return fn ? fn(type, id) : null
}

function callSet(type: DataKeys, fnName: StateFn3Arg, id: string, value: unknown) {
    const fn = stateFiles[type]?.[fnName] as StateFn3 | undefined
    return fn ? fn(type, id, value) : null
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
    // ----- METADATA READS ----- (for buildPayload.ts)
    getSize(type: DataKeys, id: string) { return callGet(type, 'getSize', id) },
    getThumbSize(type: DataKeys, id: string) { return callGet(type, 'getThumbSize', id) },
    getPosition(type: DataKeys, id: string) { return callGet(type, 'getPosition', id) },
    getConstraints(type: DataKeys, id: string) { return callGet(type, 'getConstraints', id) },
    getCurrentIndex(type: DataKeys, id: string) { return callGet(type, 'getCurrentIndex', id) },

    // ----- PURE READ ----- (for vue components and for importing reacting with the registered element)
    get(type: DataKeys, id: string) { return callGet(type, 'get', id) },

    // ----- EFFECTFUL WRITES ----- (by vue components)
    ensure(type: DataKeys, id: string) { return callGet(type, 'ensure', id) },

    setCount(type: DataKeys, id: string, length: number) { return callSet(type, 'setCount', id, length) },
    setSize(type: DataKeys, id: string, value: Vec2) { return callSet(type, 'setSize', id, value) },
    setThumbSize(type: DataKeys, id: string, value: Vec2) { return callSet(type, 'setThumbSize', id, value) },
    setPosition(type: DataKeys, id: string, position: Vec2 | number | null) { return callSet(type, 'setPosition', id, position) },
    setConstraints(type: DataKeys, id: string, constraints: Vec2 | DragData['constraints']) { return callSet(type, 'setConstraints', id, constraints) },

    // ----- SOLVER MUTATIONS -----

    //could seperate into its own thing... since TS is complaining about arguments being 2...

    press(type: DataKeys, desc: Descriptor) { return callMutate(type, 'press', desc) },
    swipeStart(type: DataKeys, desc: Descriptor) { return callMutate(type, 'swipeStart', desc) },
    swipe(type: DataKeys, desc: Descriptor) { return callMutate(type, 'swipe', desc) },
    swipeCommit(type: DataKeys, desc: Descriptor) { return callMutate(type, 'swipeCommit', desc) },
    swipeRevert(type: DataKeys, desc: Descriptor) { return callMutate(type, 'swipeRevert', desc) }
}