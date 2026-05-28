import { getCommitOffset, normalizeBase } from '../../solvers/solverUtils/axisUtils.ts'
import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { Normalized1D } from '../../../typeScript/descriptor/ctxType.ts'
import type { CarouselDesc } from '../../../typeScript/descriptor/descriptor.ts'
import type { Axis } from '../../../typeScript/core/primitiveType.ts'

export const carouselUtils = {

  normalize(desc: CarouselDesc): Normalized1D {
    const { axis } = desc.base
    if (axis === 'both') return {}
    const base = normalizeBase(desc.base, desc.ctx.delta)
    const track = vector.resolveByAxis1D(desc.data.sceneSize.width, desc.data.sceneSize.height, axis)
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

    if (vector.shouldCommit(mainDelta, mainSize, axis)) {
      const direction = vector.resolveDirection1D(mainDelta, axis)
      if (direction) {
        const delta = getCommitOffset(direction, mainSize)
        return { direction, delta }
      }
    }
    return null
  }
}