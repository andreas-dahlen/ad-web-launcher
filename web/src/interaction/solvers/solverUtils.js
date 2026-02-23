
import { APP_SETTINGS } from "../../config/appSettings"
import { vector } from "./vectorUtils"

export const utils = {
    /* -------------------------
        noramlize
    -------------------------- */
    normalize1D(desc) {
        const { delta, laneSize, sliderThumbSize, axis, startOffset } = desc
        const { prim: mainTrackSize, sub: crossTrackSize } = 
        vector.resolveByAxis1D(laneSize, axis)
        const { prim: mainThumbSize, sub: crossThumbSize } = 
        vector.resolveByAxis1D(sliderThumbSize, axis)
        const { prim: mainOffset, sub: crossOffset }  = 
        vector.resolveByAxis1D(startOffset, axis)
        const { prim: mainDelta, sub: crossDelta } = 
        vector.resolveByAxis1D(delta, axis)
        return { mainTrackSize, 
            crossTrackSize, 
            mainThumbSize, 
            crossThumbSize, 
            mainOffset, 
            crossOffset, 
            mainDelta, 
            crossDelta }
    },
    /* -------------------------
        generic
    -------------------------- */
    resolveGate(norm) {
        const { crossThumbSize, crossOffset, crossDelta } = norm
        const currentPos = crossDelta + crossOffset
        return currentPos < 0 || currentPos > crossThumbSize
    },
    /* -------------------------
        slider-specifics
    -------------------------- */

    resolveSliderStart(norm, sliderConstraints) {
    const { mainTrackSize, mainOffset, mainThumbSize } = norm
    const { min, max } = sliderConstraints
    const range = max - min
    const halfThumb = mainThumbSize / 2
    const usable = mainTrackSize - mainThumbSize
    const shifted = mainOffset - halfThumb
    const ratio = shifted / usable
    const clampedRatio = vector.clamp(ratio, 0, 1)
    const value = min + clampedRatio * range
    return value
    },

    resolveSliderSwipe(norm, sliderConstraints, sliderPosition) {
    //     const { primSize, primDelta } = norm
    //     console.log('swipe position: ', sliderPosition)
    //     const { min, max } = sliderConstraints
    //     const range = max - min

    //     // Calculate valid pixel offset range based on current position
    //     const maxOffset = ((max - sliderPosition) / range) * primSize
    //     const minOffset = ((min - sliderPosition) / range) * primSize
    //     const newDelta = vector.clamp(primDelta, minOffset, maxOffset)
    //     return newDelta
    return undefined
    },

    resolveSliderCommit(norm, sliderConstraints, sliderPosition) {
        // const { primSize, primDelta } = norm
        // console.log('swipeCommit position: ', sliderPosition)
        // const { min, max } = sliderConstraints
        // const range = max - min

        // // Convert pixel delta → logical delta
        // const deltaLogical = (primDelta / primSize) * range
        // const unclamped = sliderPosition + deltaLogical
        // const finalValue = vector.clamp(unclamped, min, max)
        // return finalValue
        return undefined
    },
    /* -------------------------
        carousel-specifics
    -------------------------- */
    resolveCarouselCommit(norm, axis) {
        const { mainTrackSize, mainDelta } = norm
        if (this.shouldCommit(mainDelta, mainTrackSize, axis)) {
            const direction = vector.resolveDirection(mainDelta, axis)
            const delta = this.getCommitOffset(direction, mainTrackSize)
            return {direction, delta}
        }
        return null
    },

    getCommitOffset(direction, laneSize) {
        if (!laneSize) return 0
        if (direction === 'right' || direction === 'down') return laneSize
        if (direction === 'left' || direction === 'up') return -laneSize
        return 0
    },

    shouldCommit(delta, laneSize, axis) {
        if (!laneSize) return false
        const axisBias = axis === 'vertical' ? 0.65 : 1
        const threshold = laneSize * APP_SETTINGS.swipeCommitRatio * axisBias
        return Math.abs(delta) >= threshold
    }
}
