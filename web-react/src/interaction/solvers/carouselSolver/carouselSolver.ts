// carouselSolver.js
/**
 * Carousel solver: decides commit vs revert, returns ctx payloads.
 * 
 */
import type { CarouselDesc } from '../../types/descriptor.types.ts'
import type { EventType } from '../../../shared/typing/core.types.ts'
import type { CarouselSolution, Runtime } from '../../types/Runtime.types.ts'
import { carouselUtils } from './carouselUtils.ts'
import { exceedsCrossRange } from '../utils/axisUtils.ts'
import type { ComputedPatch } from '@interaction/types/computed.types.ts'

export const carouselSolver: Partial<
  Record<EventType, (runtime: Runtime, desc: CarouselDesc, computed: ComputedPatch) => CarouselSolution>
> = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return { delta1D: 0, storeAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp delta and return offset reaction
   */
  swipe(runtime, desc) {
    const norm = carouselUtils.normalize(desc.base, desc.data, runtime.delta) //needs runtime.delta, desc.base.axis and data... so just pass desc and runtime.delta..., 
    const gated = exceedsCrossRange(norm)
    if (norm.mainDelta == null) return { storeAccepted: false }

    const locked = desc.data.lockSwipeAt
      ? carouselUtils.isLocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : false

    if (gated || locked) return { storeAccepted: false }
    return { delta1D: norm.mainDelta, storeAccepted: true }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */
  swipeCommit(runtime, desc) {
    const norm = carouselUtils.normalize(desc.base, desc.data, runtime.delta)
    const gated = exceedsCrossRange(norm)

    if (norm.mainDelta == null) return { delta1D: 0, outcome: 'revert', storeAccepted: true }

    const locked = desc.data.lockSwipeAt
      ? carouselUtils.isLocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : false

    if (gated || locked) return { delta1D: 0, outcome: 'revert', storeAccepted: true }

    const solution = carouselUtils.resolveCommit(norm, desc.base.axis)
    if (solution) return {
      direction: solution.direction,
      delta1D: solution.delta,
      storeAccepted: true
    }
    return { delta1D: 0, outcome: 'revert', storeAccepted: true }
  }
}


