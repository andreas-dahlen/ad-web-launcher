import { getCommitOffset, normalizeBase } from '../utils/axisUtils.ts'
import { vector } from '../utils/vectorUtils.ts'
import type { Normalized1D } from '../../types/Runtime.types.ts'
import type { Axis, Vec2 } from '../../../shared/typing/core.types.ts'
import type { BaseWithAxis1D } from '@interaction/types/base.types.ts'
import type { CarouselData } from '@interaction/types/data.types.ts'

export const carouselUtils = {

  normalize(base: BaseWithAxis1D, data: CarouselData, delta: Vec2): Normalized1D {
    const basics = normalizeBase(base.grabOffset, base.axis, delta)
    const track = vector.resolveByAxis1D(data.sceneSize.width, data.sceneSize.height, base.axis)
    return {
      ...basics,
      mainSize: track?.main,
      crossSize: track?.cross
    }
  },

  isLocked(delta: number, index: number, lock: { prev: number | null, next: number | null }) {
    const { prev, next } = lock || {}
    if (prev == null && next == null) return false
    if (prev != null && prev === index && delta > 0) return true
    if (next != null && next === index && delta < 0) return true
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