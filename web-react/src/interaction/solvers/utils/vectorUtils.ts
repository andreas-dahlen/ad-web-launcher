import type { DragLayout } from '@interaction/types/data.types'
import type { Axis, Axis1D, Direction, OnEdgeDir, Vec2 } from '../../../shared/typing/core.types'
import { APP_CONFIG } from '@config/appConfig'

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
  },
  isThresholdDirAndOnEdgeDir(onEdgeDir: OnEdgeDir, axis: Axis, thresholdValue: Vec2): boolean {
    const dirVal = axis === 'horizontal'
      ? thresholdValue.x
      : thresholdValue.y
    const dir = vector.resolveDirection1D(dirVal, axis)
    if (!dir) return false
    const result = dir.dir == 'up' && onEdgeDir == 'down' ||
      dir.dir == 'down' && onEdgeDir == 'up' ||
      dir.dir == 'left' && onEdgeDir == 'right' ||
      dir.dir == 'right' && onEdgeDir == 'left' ?
      true : false
    return result
  },

  shouldCommit(delta: number, laneSize: number, axis: Axis) {
    if (laneSize == null) return false
    const axisBias = axis === 'vertical' ? 0.65 : 1
    const threshold = laneSize * APP_CONFIG.swipeCommitRatio * axisBias
    return Math.abs(delta) >= threshold
  }
}
