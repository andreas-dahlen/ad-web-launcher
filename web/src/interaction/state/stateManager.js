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

export const state = {
    //buildPayload
    getSize(type, laneId) { 
        if (type !== 'drag') return call(type, 'getSize', laneId) },

    getMin(type, laneId) {
        if (type === 'slider')  return call(type, 'getMin', laneId) },

    getMax(type, laneId) { 
        if (type === 'slider') return call(type, 'getMax', laneId) },

    getValue(type, laneId) { 
        if (type === 'slider') return call(type, 'getValue', laneId) },

    getBounds(type, laneId) {
        if (type === 'drag') return call (type, 'getBounds', laneId) },

    //calls from Vue components
    ensure(type, laneId) { return call(type, 'ensure', laneId) },
    setCount(type, laneId, length) { return call(type, 'setCount', laneId, length) },
    setSize(type, laneId, value) { return call(type, 'setSize', laneId, value) },
    finalTransition(type, laneId) { return call(type, 'finalTransition', laneId)},
     setMinMax(type, laneId, min, max) { return call(type, 'setMinMax', laneId, min, max)},
     setBounds(type, laneId, packet) { return call(type, 'setBounds', laneId, packet)},

    // descriptor calls
    swipeStart(type, desc){ return call(type, 'swipeStart', desc)},
    swipe(type, desc){ return call(type, 'swipe', desc)},
    swipeCommit(type, desc){ return call(type, 'swipeCommit',desc)},
    swipeRevert(type, desc){ return call(type, 'swipeRevert', desc)}
}