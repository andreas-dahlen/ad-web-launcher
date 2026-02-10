
import { APP_SETTINGS } from "../../config/appSettings"

export const utils = {
    clamp(delta, arg2, max) {
        // Carousel-style: only 2 args, second is laneSize
        if (max === undefined) {
            const laneSize = arg2
            if (laneSize === undefined) return delta
            return Math.max(-laneSize, Math.min(laneSize, delta))
        }

        // Generic min/max: 3 args
        const min = arg2
        return Math.max(min, Math.min(max, delta))
    },

    clamp2D(delta, position, constraints) {
        const { x: dx, y: dy } = delta
        const { x: px, y: py } = position
        const { minX, maxX, minY, maxY } = constraints

        return {
            x: this.clamp(px + dx, minX, maxX),
            y: this.clamp(py + dy, minY, maxY)
        }
    },
    relativeClamp2D(delta, position, constraints) {
        const clamped = this.clamp2D(delta, position, constraints)

        return {
            x: clamped.x - position.x,
            y: clamped.y - position.y
        }
    },
    resolveDirection(delta, axis) {
        // 1D axis-based
        if (axis) {
            if (!delta) return null
            return axis === 'horizontal'
                ? (delta > 0 ? 'right' : 'left')
                : (delta > 0 ? 'down' : 'up')
        }

        // 2D dominant axis
        const { x, y } = delta
        if (x === 0 && y === 0) return null
        return Math.abs(x) >= Math.abs(y)
            ? (x > 0 ? 'right' : 'left')
            : (y > 0 ? 'down' : 'up')
    },
    //carousel-specific-helpers
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
