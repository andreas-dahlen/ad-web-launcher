
import { APP_SETTINGS } from "../../app/config/appSettings.ts"
import type { Descriptor, Normalized1D, Axis, Direction, Vec2 } from "../../types/gestures.ts"
import { vector } from "./vectorUtils.ts"

export const utils = {
    /* -------------------------
        noramlize
    -------------------------- */
    normalize1D(desc: Descriptor): Normalized1D {
        const { delta, axis, startOffset } = desc
        const laneSize = desc.carousel?.size ?? desc.slider?.size ?? null

        const sliderThumbSize = desc.slider?.thumbSize ?? null
        if (!axis) return {}
        const track = laneSize 
        ? vector.resolveByAxis1D(laneSize, axis) : null

        const thumb = sliderThumbSize 
        ? vector.resolveByAxis1D(sliderThumbSize, axis) : null

        const offset = startOffset ? 
        vector.resolveByAxis1D(startOffset, axis) : null
        
        const movement = typeof delta === "object" 
        ? vector.resolveByAxis1D(delta, axis) : null

        return {
            mainTrackSize: track?.prim,
            crossTrackSize: track?.sub,
            mainThumbSize: thumb?.prim,
            crossThumbSize: thumb?.sub,
            mainOffset: offset?.prim,
            crossOffset: offset?.sub,
            mainDelta: movement?.prim,
            crossDelta: movement?.sub
        }
    },
    /* -------------------------
        generic
    -------------------------- */
    resolveGate(norm: Normalized1D) {
        const { crossTrackSize, crossOffset, crossDelta } = norm
        if (!crossTrackSize || !crossOffset || !crossDelta) return
        const currentPos = crossOffset + crossDelta

        return currentPos < 0 || currentPos > crossTrackSize
    },
    /* -------------------------
        slider-specifics
    -------------------------- */

    resolveSliderStart(norm: Normalized1D,
        { min, max }: { min: number, max: number }) {

        const { mainTrackSize, mainOffset, mainThumbSize } = norm
         if (!mainTrackSize || !mainOffset || !mainThumbSize) return
        const range = max - min
        const usable = mainTrackSize - mainThumbSize
        const ratio = (mainOffset - mainThumbSize / 2) / usable
        const value = min + vector.clamp(ratio, 0, 1) * range
        return {
            value, valuePerPixel: range / usable
        }
    },

    resolveSliderSwipe(norm: Normalized1D, desc: Descriptor) {
        if (!desc.slider) return

        const { constraints: {min, max}, sliderValuePerPixel, sliderStartOffset } = desc.slider
        const mainDelta = norm.mainDelta

        if (mainDelta == null || 
            sliderValuePerPixel == null || 
            sliderStartOffset == null
        ) return

        const nextValue = sliderStartOffset + mainDelta * sliderValuePerPixel
        return vector.clamp(nextValue, min, max)
    },
    /* -------------------------
        carousel-specifics
    -------------------------- */

    isCarouselBlocked(delta: number, index: number, lock: {prev: number, next: number}) {
        const { prev, next } = lock || {}
        if (prev == null && next == null) return false
        if (prev != null && prev - 1 === index && delta > 0) return true
        if (next != null && next - 1 === index && delta < 0) return true
        return false
    },

    resolveCarouselCommit(norm: Normalized1D, axis: Axis) {
        const { mainTrackSize, mainDelta } = norm
        if (mainDelta == null || mainTrackSize == null) return

        if (this.shouldCommit(mainDelta, mainTrackSize, axis)) {
            const direction = vector.resolveDirection(mainDelta, axis)
            if(direction) {
                const delta = this.getCommitOffset(direction, mainTrackSize)
                return { direction, delta }
            }
        }
        return null
    },

    getCommitOffset(direction: Direction, laneSize: number) {
        if (!laneSize) return 0
        if (direction === 'right' || direction === 'down') return laneSize
        if (direction === 'left' || direction === 'up') return -laneSize
        return 0
    },

    shouldCommit(delta: number, laneSize: number, axis: Axis) {
        if (!laneSize) return false
        const axisBias = axis === 'vertical' ? 0.65 : 1
        const threshold = laneSize * APP_SETTINGS.swipeCommitRatio * axisBias
        return Math.abs(delta) >= threshold
    },
    /* -------------------------
         drag-specifics
    -------------------------- */
    resolveDragSwipe(desc: Descriptor) {
        const { delta } = desc
        const dragPosition = desc.drag?.position ?? { x: 0, y: 0 }
        const dragConstraints = desc.drag?.constraints ?? { min: 0, max: 100 }
        if (typeof delta !== "object") return
        const clamped = 
        vector.relativeClamp2D(delta, dragPosition, dragConstraints)
        const dx = clamped.x
        const dy = clamped.y
        return { x: dx, y: dy }
    },

    resolveDragCommit(desc: Descriptor) {
        const delta = desc.delta
        if (typeof delta !== "object") return
        return vector.clamp2D(delta, desc.drag.position, desc.drag.constraints)
    },

    resolveSnapAdjustment(desc: Descriptor, value: Vec2) {
        if (!desc.drag?.snap) return null
        const { x: snapX, y: snapY } = desc.drag.snap
        const dragConstraints = desc.drag.constraints

        const snapAxis = (v: number, count: number, min: number, max: number) => {
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

    resolveDragDirection(oldPosition: Vec2, value: Vec2) {
        const { x: fx, y: fy } = value
        const { x: px, y: py } = oldPosition
        return vector.resolveDirection({ x: fx - px, y: fy - py })
    }
}

