import type { DragData, Vec2, Axis, VecOrScalar } from "../../types/gestures"

export const vector = {
    clamp(delta: number, min: number, max: number) {
        if (min === undefined || max === undefined) return delta
        return Math.max(min, Math.min(max, delta))
    },

    clamp2D(delta: Vec2, position: Vec2, constraints: DragData["constraints"]) {
        const { x: dx, y: dy } = delta
        const { x: px, y: py } = position
        const { minX, maxX, minY, maxY } = constraints

        return {
            x: this.clamp(px + dx, minX, maxX),
            y: this.clamp(py + dy, minY, maxY)
        }
    },
    relativeClamp2D(delta: Vec2, position: Vec2, constraints: DragData["constraints"]) {
        const clamped = this.clamp2D(delta, position, constraints)

        return {
            x: clamped.x - position.x,
            y: clamped.y - position.y
        }
    },

    resolveByAxis1D(value: Vec2, axis: Axis) {
        if (!axis || !value) {
            return { prim: undefined, sub: undefined }
        }
        if (axis === 'horizontal') {
            return {
                prim: value.x,
                sub: value.y
            }
        }
        if (axis === 'vertical') {
            return {
                prim: value.y,
                sub: value.x
            }
        }
    },

    resolveDirection(delta: VecOrScalar, axis?: Axis) {
        // 1D axis-based
        if (axis) {
            if (!delta) return null
            if (typeof delta !== "object") {
                return axis === 'horizontal'
                    ? (delta > 0 ? 'right' : 'left')
                    : (delta > 0 ? 'down' : 'up')
            }
        }

        // 2D dominant axis
        if (typeof delta == "object") {
            const { x, y } = delta
            if (x === 0 && y === 0) return null
            return Math.abs(x) >= Math.abs(y)
                ? (x > 0 ? 'right' : 'left')
                : (y > 0 ? 'down' : 'up')
        }
    }
}