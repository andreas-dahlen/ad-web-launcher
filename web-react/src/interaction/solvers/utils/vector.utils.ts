import type { Axis, Axis1D, Constraints2D, AxisDirection, BoxSide, Vec2 } from '../../../shared/types/core.types'
import { APP_CONFIG } from '@config/app.config'

export const vector = {
  clamp(delta: number, min: number, max: number) {
    if (min === undefined || max === undefined) return delta
    return Math.max(min, Math.min(max, delta))
  },

  clamp2D(delta: Vec2, settledOffset: Vec2, constraints: Constraints2D) {
    const { x: dx, y: dy } = delta
    const { x: px, y: py } = settledOffset
    const { minX, maxX, minY, maxY } = constraints

    return {
      x: this.clamp(px + dx, minX, maxX),
      y: this.clamp(py + dy, minY, maxY)
    }
  },
  relativeClamp2D(delta: Vec2, settledOffset: Vec2, constraints: Constraints2D) {
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

  resolveDirection1D(delta: number, axis: Axis1D): AxisDirection {
    return axis === 'horizontal'
      ? ({ axis, dir: delta > 0 ? 'right' : 'left' })
      : ({ axis, dir: delta > 0 ? 'down' : 'up' })
  },


  getDir(thresholdValue: Vec2, axis: Axis1D) {
    const dir = axis === 'horizontal'
      ? thresholdValue.x
      : thresholdValue.y
    return this.resolveDirection1D(dir, axis)
  },

  isValidDir(dir: AxisDirection, overflowSide: BoxSide) {
    const pairs: Record<AxisDirection['dir'], BoxSide> = {
      down: 'top',
      up: 'bottom',
      left: 'right',
      right: 'left'
    }

    return pairs[dir.dir] === overflowSide
  },

  shouldCommit(delta: number, laneSize: number, axis: Axis) {
    if (laneSize == null) return false
    const axisBias = axis === 'vertical' ? 0.65 : 1
    const threshold = laneSize * APP_CONFIG.swipeCommitRatio * axisBias
    return Math.abs(delta) >= threshold
  }
}
