import { APP_SETTINGS } from '@config/appSettings.ts'
import { normalizeBase } from '../../solvers/solverUtils/axisUtils.ts'
import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { Normalized1D } from '../../../typeScript/ctxType.ts'
import type { CarouselDesc } from '../../../typeScript/descriptor/descriptor.ts'
import type { Axis, Direction } from '../../../typeScript/primitiveType.ts'

export const carouselUtils = {

  normalize(desc: CarouselDesc): Normalized1D {
    const { axis } = desc.base
    if (axis === 'both') return {}
    const base = normalizeBase(desc.base, desc.ctx.delta)
    const track = vector.resolveByAxis1D(desc.data.size, axis)
    return {
      ...base,
      mainSize: track?.main,
      crossSize: track?.cross
    }
  },

  isLocked(delta: number, index: number, lock: { prev: number | null, next: number | null }) {
    const { prev, next } = lock || {}
    if (prev == null && next == null) return false
    if (prev != null && prev - 1 === index && delta > 0) return true
    if (next != null && next - 1 === index && delta < 0) return true
    return false
  },

  resolveCommit(norm: Normalized1D, axis: Axis) {
    const { mainSize, mainDelta } = norm
    if (mainDelta == null || mainSize == null) return

    if (this.shouldCommit(mainDelta, mainSize, axis)) {
      const direction = vector.resolveDirection1D(mainDelta, axis)
      if (direction) {
        const delta = this.getCommitOffset(direction, mainSize)
        return { direction, delta }
      }
    }
    return null
  },

  getCommitOffset(direction: Direction, laneSize: number) {
    if (laneSize == null) return 0

    if (direction.dir === 'right' || direction.dir === 'down') return laneSize
    if (direction.dir === 'left' || direction.dir === 'up') return -laneSize
    return 0
  },

  shouldCommit(delta: number, laneSize: number, axis: Axis) {
    if (laneSize == null) return false
    const axisBias = axis === 'vertical' ? 0.65 : 1
    const threshold = laneSize * APP_SETTINGS.swipeCommitRatio * axisBias
    return Math.abs(delta) >= threshold
  }
}