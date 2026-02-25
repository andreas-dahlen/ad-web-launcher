
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
        console.log(desc.snap)
        if (!desc.snap) return null
        const { x: stepX, y:stepY } = desc.snap

        return {
            x: stepX > 0 ? Math.round(value.x / stepX) * stepX : value.x,
            y: stepY > 0 ? Math.round(value.y / stepY) * stepX : value.y
        }
    },

    resolveDragDirection(oldPosition, value) {
    const {x: fx, y: fy} = value
    const {x: px, y: py} = oldPosition
    return vector.resolveDirection({x:fx - px, y:fy - py})
    }




    // const { delta,  dragPosition = { x: 0, y: 0 }, dragConstraints = { min: 0, max: 100 } } = desc
    // const finalPos = vector.clamp2D(delta, dragPosition, dragConstraints)
    // const {x: fx, y: fy} = finalPos
    // const {x: px, y: py} = dragPosition
    // const direction = vector.resolveDirection({x:fx - px, y:fy - py})
    // return {
    //   direction: direction,
    //   delta: { x: fx, y: fy },
    //   stateAccepted: true }
}

