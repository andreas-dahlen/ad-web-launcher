// carouselSolver.js
/**
 * Carousel solver: decides commit vs revert, returns ctx payloads.
 * 
 */
import { carouselUtils } from './carouselUtils.ts'
import { exceedsCrossRange } from '../utils/axisUtils.ts'
import type { CarouselSolver } from '@interaction/types/solver.types.ts'


export const carouselSolver: CarouselSolver = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  // swipeStart() {},

  /**
   * Handle swipe (drag) - clamp delta and return offset reaction
   */
  swipe(runtime, desc) {
    const norm = carouselUtils.normalize(desc.base, runtime.delta) //needs runtime.delta, desc.base.axis and data... so just pass desc and runtime.delta..., 
    const gated = exceedsCrossRange(norm)

    const locked = desc.data.lockSwipeAt
      ? carouselUtils.isLocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : false

    if (gated || locked) return null
    return { routing: "store", solv: { delta1D: norm.mainDelta } }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */
  swipeCommit(runtime, desc) {
    const norm = carouselUtils.normalize(desc.base, runtime.delta)
    const gated = exceedsCrossRange(norm)

    const locked = desc.data.lockSwipeAt
      ? carouselUtils.isLocked(norm.mainDelta, desc.data.index, desc.data.lockSwipeAt)
      : false

    if (gated || locked) return { routing: "replace-event", event: 'swipeRevert' }

    const solution = carouselUtils.resolveCommit(norm, desc.base.axis)
    if (solution) return {
      routing: "store",
      solv: {
        direction: solution.direction,
        delta1D: solution.delta,
      }
    }
    return { routing: 'replace-event', event: 'swipeRevert' }
  }
}


