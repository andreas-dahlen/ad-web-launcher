import { getCommitOffset, normalizeBase } from '../utils/axis.utils.ts'
import { vector } from '../utils/vector.utils.ts'
import type { Axis1D, Vec2 } from '../../../shared/types/core.types.ts'
import type { BaseWithAxis1D } from '../../types/descriptor/base.types.ts'
import type { Normalized1D } from '../../types/solver.types.ts'

export const carouselUtils = {

  normalize(base: BaseWithAxis1D, delta: Vec2): Normalized1D {
    const basics = normalizeBase(base.layout.grabOffset, base.axis, delta)
    const track = vector.resolveByAxis1D(base.layout.containerSize.width, base.layout.containerSize.height, base.axis)
    const scene = vector.resolveByAxis1D(base.layout.itemSize.width, base.layout.itemSize.height, base.axis)
    return {
      ...basics,
      mainSize: track.main,
      crossSize: track.cross,
      mainitemSize: scene.main,
      crossitemSize: scene.cross
    }
  },

  isLocked(delta: number, index: number, lock: { prev: number | null, next: number | null }) {
    const { prev, next } = lock || {}
    if (prev == null && next == null) return false
    if (prev != null && prev === index && delta > 0) return true
    if (next != null && next === index && delta < 0) return true
    return false
  },

  resolveCommit(norm: Normalized1D, axis: Axis1D) {
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