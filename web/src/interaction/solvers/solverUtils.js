
import { APP_SETTINGS } from "../../config/appSettings"
import { vector } from "./vectorUtils"

export const utils = {
    /* -------------------------
        noramlize
    -------------------------- */
    normalize1D(desc) {
        const { delta, laneSize, sliderThumbSize, axis, startOffset } = desc
        const track = vector.resolveByAxis1D(laneSize, axis)
        const thumb = vector.resolveByAxis1D(sliderThumbSize, axis)
        const offset = vector.resolveByAxis1D(startOffset, axis)
        const movement = vector.resolveByAxis1D(delta, axis)

        return {
            mainTrackSize: track.prim,
            crossTrackSize: track.sub,
            mainThumbSize: thumb.prim,
            crossThumbSize: thumb.sub,
            mainOffset: offset.prim,
            crossOffset: offset.sub,
            mainDelta: movement.prim,
            crossDelta: movement.sub
        }
    },
    /* -------------------------
        generic
    -------------------------- */
    resolveGate(norm) {
        const { crossTrackSize, crossOffset, crossDelta } = norm

        const currentPos = crossOffset + crossDelta

        return currentPos < 0 || currentPos > crossTrackSize
    },
    /* -------------------------
        slider-specifics
    -------------------------- */

    resolveSliderStart(norm, { min, max }) {
        const { mainTrackSize, mainOffset, mainThumbSize } = norm
        const range = max - min
        const usable = mainTrackSize - mainThumbSize
        const ratio = (mainOffset - mainThumbSize / 2) / usable
        const value = min + vector.clamp(ratio, 0, 1) * range
        return {
            value, valuePerPixel: range / usable
        }
    },

    resolveSliderSwipe(norm, desc) {
        const { min, max } = desc.sliderConstraints
        const deltaValue = norm.mainDelta * desc.sliderValuePerPixel
        const nextValue = desc.sliderStartOffset + deltaValue
        return vector.clamp(nextValue, min, max)
    },
    /* -------------------------
        carousel-specifics
    -------------------------- */

    isCarouselBlocked(delta, index, lock) {
        const { prev, next } = lock || {}
        if (prev == null && next == null) return false
        if (prev != null && prev - 1 === index && delta > 0) return true
        if (next != null && next - 1 === index && delta < 0) return true
        return false
    },

    resolveCarouselCommit(norm, axis) {
        const { mainTrackSize, mainDelta } = norm
        if (this.shouldCommit(mainDelta, mainTrackSize, axis)) {
            const direction = vector.resolveDirection(mainDelta, axis)
            const delta = this.getCommitOffset(direction, mainTrackSize)
            return { direction, delta }
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
    },
    /* -------------------------
         drag-specifics
    -------------------------- */
    resolveDragSwipe(desc) {
        const { delta, dragPosition = { x: 0, y: 0 }, dragConstraints = { min: 0, max: 100 } } = desc
        const clamped = vector.relativeClamp2D(delta, dragPosition, dragConstraints)
        const dx = clamped.x
        const dy = clamped.y
        return { x: dx, y: dy }
    },

    resolveDragCommit(desc) {
        return vector.clamp2D(desc.delta, desc.dragPosition, desc.dragConstraints)
    },

resolveSnapAdjustment(desc, value) {
    if (!desc.snap) return null
    const { x: snapX, y: snapY } = desc.snap
    const { dragConstraints } = desc

    const snapAxis = (v, count, min, max) => {
        if (!count || count <= 0) return v
        const range = max - min
        if (count === 1) { return min + range / 2 }
        // Divide range into equal segments
        const step = range / (count - 1)
        // Translate to 0-based range before snapping
        const relative = v - min
        const snapped = Math.round(relative / step) * step
        return min + snapped
    }
    return {
        x: snapAxis(value.x, snapX, dragConstraints.minX, dragConstraints.maxX),
        y: snapAxis(value.y, snapY, dragConstraints.minY, dragConstraints.maxY)
    }
},

    resolveDragDirection(oldPosition, value) {
    const {x: fx, y: fy} = value
    const {x: px, y: py} = oldPosition
    return vector.resolveDirection({x:fx - px, y:fy - py})
    }
}

