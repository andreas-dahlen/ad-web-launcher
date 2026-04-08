import type { DragData } from '@interaction/types/descriptor/dataType'
import type { Axis, Direction, Vec2 } from '@interaction/types/primitiveType'

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

  resolveByAxis1D(value: Vec2, axis: Exclude<Axis, 'both'>) {
    if (!value) return { prim: undefined, sub: undefined }

    switch (axis) {
      case 'horizontal': return { prim: value.x, sub: value.y }
      case 'vertical': return { prim: value.y, sub: value.x }
      default:
        throw new Error(`resolveByAxis1D called with unknown axis: ${axis}`)
    }
  },

  //carousel only
  resolveDirection(delta: number, axis: Axis): Direction | null {
    if (typeof delta !== "object" && axis !== 'both') {
      return axis === 'horizontal'
        ? ({ axis, dir: delta > 0 ? 'right' : 'left' })
        : ({ axis, dir: delta > 0 ? 'down' : 'up' })
    }
    return null
  }
}