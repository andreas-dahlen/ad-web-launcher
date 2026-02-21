export const vector = {
    clamp(delta, min, max) {
        if (min === undefined || max === undefined) return delta
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

    resolveDelta1D(delta, axis) {
        if (!delta || !axis) return undefined

        if (axis === 'horizontal') return delta.x
        if (axis === 'vertical') return delta.y
    },

    resolveGateDelta1D(delta, axis) {
        if (!delta || !axis) return undefined

        if (axis === 'horizontal') return delta.y
        if (axis === 'vertical') return delta.x
    },

    resolveSize(laneSize, axis) {
        if (!axis || !laneSize) {
            return { primSize: undefined, gateSize: undefined }
        }
        if (axis === 'horizontal') {
            return {
                primSize: laneSize.x,
                gateSize: laneSize.y
            }
        }
        if (axis === 'vertical') {
            return {
                primSize: laneSize.y,
                gateSize: laneSize.x
            }
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
    }
}