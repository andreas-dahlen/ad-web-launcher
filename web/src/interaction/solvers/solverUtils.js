
import { APP_SETTINGS } from "../../config/appSettings"
import { vector } from "./vectorUtils"

export const utils = {
    /* -------------------------
        noramlize
    -------------------------- */
    normalize1D(desc) {
        const { delta, laneSize, axis, startOffset } = desc
        const { primSize, gateSize } = vector.resolveSize(laneSize, axis)
        const gateStart = vector.resolveGateDelta1D(startOffset, axis)
        const gateDelta = vector.resolveGateDelta1D(delta, axis)
        const primDelta = vector.resolveDelta1D(delta, axis)
        return { primSize, gateSize, gateStart, gateDelta, primDelta }
    },
    /* -------------------------
        generic
    -------------------------- */
    resolveGate(norm) {
        const { gateSize, gateStart, gateDelta } = norm
        const currentPos = gateDelta + gateStart
        return currentPos < 0 || currentPos > gateSize
    },
    /* -------------------------
        slider-specifics
    -------------------------- */
    resolveSliderSwipe(norm, sliderConstraints, sliderPosition) {
        const { primSize, primDelta } = norm

        const { min, max } = sliderConstraints
        const range = max - min

        // Calculate valid pixel offset range based on current position
        const maxOffset = ((max - sliderPosition) / range) * primSize
        const minOffset = ((min - sliderPosition) / range) * primSize
        const newDelta = vector.clamp(primDelta, minOffset, maxOffset)

        return newDelta
    },

    resolveSliderCommit(norm, sliderConstraints, sliderPosition) {
        const { primSize, primDelta } = norm

        const { min, max } = sliderConstraints
        const range = max - min

        // Convert pixel delta → logical delta
        const deltaLogical = (primDelta / primSize) * range
        const unclamped = sliderPosition + deltaLogical
        const finalValue = vector.clamp(unclamped, min, max)

        return finalValue
    },
    /* -------------------------
        carousel-specifics
    -------------------------- */
    resolveCarouselCommit(norm, axis) {
        const { primSize, primDelta } = norm
        if (this.shouldCommit(primDelta, primSize, axis)) {
            const direction = vector.resolveDirection(primDelta, axis)
            const delta = this.getCommitOffset(direction, primSize)
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
