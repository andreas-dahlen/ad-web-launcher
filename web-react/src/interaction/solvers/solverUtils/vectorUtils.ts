import type { DragData } from '../../types/descriptor/dataType.ts'
import type { Axis, Axis1D, Direction, Vec2 } from '../../types/primitiveType.ts'

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

  resolveByAxis1D(value: Vec2, axis: Axis1D) {
    switch (axis) {
      case 'horizontal': return { main: value.x, cross: value.y }
      case 'vertical': return { main: value.y, cross: value.x }
      default:
        throw new Error(`resolveByAxis1D called with unknown axis: ${axis}`)
    }
  },

  resolveDirection1D(delta: number, axis: Axis): Direction | null {
    if (axis !== 'both') {
      return axis === 'horizontal'
        ? ({ axis, dir: delta > 0 ? 'right' : 'left' })
        : ({ axis, dir: delta > 0 ? 'down' : 'up' })
    }
    return null
  }
}