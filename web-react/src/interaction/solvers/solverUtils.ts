
import { APP_SETTINGS } from "@config/appSettings.ts"
import { vector } from "./vectorUtils.ts"

interface Normalized1D {
    mainTrackSize?: number | null
    crossTrackSize?: number | null
    mainThumbSize?: number | null
    crossThumbSize?: number | null
    mainOffset?: number | null
    crossOffset?: number | null
    mainDelta?: number | null
    crossDelta?: number | null
}

export const utils = {
    /* -------------------------
        normalize
    -------------------------- */
    normalize1D(desc: Descriptor): Normalized1D {
        const { baseOffset, axis } = desc.base
        const delta = desc.runtime.delta
        if (!axis) return {}

        // lane/track size only exists on carousel or slider
        let trackSize: Vec2 | null = null

        if (desc.base.type === 'carousel') {
            trackSize = (desc.data as CarouselDescriptor['data']).size
        } else if (desc.base.type === 'slider') {
            trackSize = (desc.data as SliderDescriptor['data']).size
        }

        // thumb only exists on slider
        const thumbSize = desc.base.type === 'slider'
            ? (desc.data as SliderDescriptor['data']).thumbSize
            : null

        const track = trackSize ? vector.resolveByAxis1D(trackSize, axis) : null
        const thumb = thumbSize ? vector.resolveByAxis1D(thumbSize, axis) : null
        const offset = baseOffset ? vector.resolveByAxis1D(baseOffset, axis) : null
        const movement = delta ? vector.resolveByAxis1D(delta, axis) : null

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
        const currentPos = (norm.crossOffset ?? 0) + (norm.crossDelta ?? 0)
        const crossSize = norm.crossTrackSize ?? 0
        return currentPos < APP_SETTINGS.hysteresis || currentPos > crossSize + APP_SETTINGS.hysteresis
    },
    /* -------------------------
        slider-specifics
    -------------------------- */

    resolveSliderStart(norm: Normalized1D,
        { min, max }: { min: number, max: number }) {

        const { mainTrackSize, mainOffset, mainThumbSize } = norm
        if (mainTrackSize == null || mainOffset == null || mainThumbSize == null) return
        const range = max - min
        const usable = mainTrackSize - mainThumbSize
        const ratio = (mainOffset - mainThumbSize / 2) / usable
        const value = min + vector.clamp(ratio, 0, 1) * range
        return {
            value, valuePerPixel: range / usable
        }
    },

    resolveSliderSwipe(norm: Normalized1D, desc: SliderDescriptor) {
        const { sliderValuePerPixel, sliderStartOffset } = desc.runtime
        const { constraints: { min, max } } = desc.data
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

    isCarouselBlocked(delta: number, index: number, lock: { prev: number, next: number }) {
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
            if (direction) {
                const delta = this.getCommitOffset(direction, mainTrackSize)
                return { direction, delta }
            }
        }
        return null
    },

    getCommitOffset(direction: Direction, laneSize: number) {
        if (laneSize == null) return 0
        if (direction === 'right' || direction === 'down') return laneSize
        if (direction === 'left' || direction === 'up') return -laneSize
        return 0
    },

    shouldCommit(delta: number, laneSize: number, axis: Axis) {
        if (laneSize == null) return false
        const axisBias = axis === 'vertical' ? 0.65 : 1
        const threshold = laneSize * APP_SETTINGS.swipeCommitRatio * axisBias
        return Math.abs(delta) >= threshold
    },
    /* -------------------------
         drag-specifics
    -------------------------- */
    resolveDragSwipe(desc: DragDescriptor) {
        const delta = desc.runtime.delta
        const dragPosition = desc.data.position
        const dragConstraints = desc.data.constraints
        const clamped =
            vector.relativeClamp2D(delta, dragPosition, dragConstraints)
        const dx = clamped.x
        const dy = clamped.y
        return { x: dx, y: dy }
    },

    resolveDragCommit(desc: DragDescriptor) {
        const delta = desc.runtime.delta
        return vector.clamp2D(delta, desc.data.position, desc.data.constraints)
    },

    resolveSnapAdjustment(desc: DragDescriptor, value: Vec2) {
        if (!desc.data?.snap) return null
        const { x: snapX, y: snapY } = desc.data.snap
        const dragConstraints = desc.data.constraints

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