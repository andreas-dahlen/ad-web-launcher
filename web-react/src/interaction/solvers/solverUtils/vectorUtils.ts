import type { DragLayout } from '@typeScript/descriptor/dataType.ts'
import type { Axis, Axis1D, Direction, Vec2 } from '@typeScript/core/primitiveType'

export const vector = {
  clamp(delta: number, min: number, max: number) {
    if (min === undefined || max === undefined) return delta
    return Math.max(min, Math.min(max, delta))
  },

  clamp2D(delta: Vec2, settledOffset: Vec2, constraints: DragLayout["constraints"]) {
    const { x: dx, y: dy } = delta
    const { x: px, y: py } = settledOffset
    const { minX, maxX, minY, maxY } = constraints

    return {
      x: this.clamp(px + dx, minX, maxX),
      y: this.clamp(py + dy, minY, maxY)
    }
  },
  relativeClamp2D(delta: Vec2, settledOffset: Vec2, constraints: DragLayout["constraints"]) {
    const clamped = this.clamp2D(delta, settledOffset, constraints)

    return {
      x: clamped.x - settledOffset.x,
      y: clamped.y - settledOffset.y
    }
  },

  resolveByAxis1D(x: number, y: number, axis: Axis1D) {
    switch (axis) {
      case 'horizontal': return { main: x, cross: y }
      case 'vertical': return { main: y, cross: x }
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