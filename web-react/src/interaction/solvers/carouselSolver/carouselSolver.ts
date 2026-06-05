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
import type { Computed } from '@interaction/types/computed.types.ts'

export const carouselSolver: Partial<
  Record<EventType, (runtime: Runtime, desc: CarouselDesc, computed: Computed) => CarouselSolution>
> = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return { delta1D: 0, storeAccepted: true } satisfies CarouselSolution
  },

  /**
   * Handle swipe (drag) - clamp delta and return offset reaction
   */
  swipe(runtime, desc) {
    const norm = carouselUtils.normalize(desc.base, runtime.delta) //needs runtime.delta, desc.base.axis and data... so just pass desc and runtime.delta..., 
    const gated = exceedsCrossRange(norm)
    if (norm.mainDelta == null) return { storeAccepted: false } satisfies CarouselSolution

    const locked = desc.data.lockSwipeAt
      ? carouselUtils.isLocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : false

    if (gated || locked) return { storeAccepted: false }
    return { delta1D: norm.mainDelta, storeAccepted: true } satisfies CarouselSolution
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */
  swipeCommit(runtime, desc) {
    const norm = carouselUtils.normalize(desc.base, runtime.delta)
    const gated = exceedsCrossRange(norm)

    if (norm.mainDelta == null) return { delta1D: 0, event: 'swipeRevert', storeAccepted: true } satisfies CarouselSolution

    const locked = desc.data.lockSwipeAt
      ? carouselUtils.isLocked(norm.mainDelta, desc.data.index, desc.data.lockSwipeAt)
      : false

    if (gated || locked) return { delta1D: 0, event: 'swipeRevert', storeAccepted: true } satisfies CarouselSolution

    const solution = carouselUtils.resolveCommit(norm, desc.base.axis)
    if (solution) return {
      direction: solution.direction,
      delta1D: solution.delta,
      storeAccepted: true
    } satisfies CarouselSolution
    return { delta1D: 0, event: 'swipeRevert', storeAccepted: true } satisfies CarouselSolution
  }
}


