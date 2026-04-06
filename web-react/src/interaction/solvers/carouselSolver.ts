// carouselSolver.js
/**
 * Carousel solver: decides commit vs revert, returns ctx payloads.
 * 
 */
import type { CarouselDesc } from '@interaction/types/descriptor/descriptor.ts'
import type { EventType } from '@interaction/types/primitiveType.ts'
import type { CarouselCtxPartial } from '@interaction/types/ctxType.ts'
import { carouselUtils } from '@interaction/solvers/solverUtils/carouselUtils'
import { resolveGate } from '@interaction/solvers/solverUtils/utilsShared'

export const carouselSolver: Partial<Record<EventType, (desc: CarouselDesc) => CarouselCtxPartial>> = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return { stateAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp delta and return offset reaction
   */
  swipe(desc) {
    const norm = carouselUtils.normalize(desc)
    const gated = resolveGate(norm)
    if (norm.mainDelta == null) return { stateAccepted: false }

    const locked = desc.data.lockSwipeAt
      ? carouselUtils.isBlocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : null

    if (gated || locked) return { stateAccepted: false }
    return { delta1D: norm.mainDelta, stateAccepted: true }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */
  swipeCommit(desc) {
    const norm = carouselUtils.normalize(desc)
    const gated = resolveGate(norm)

    if (norm.mainDelta == null) return { event: 'swipeRevert', stateAccepted: true }

    const locked = desc.data.lockSwipeAt
      ? carouselUtils.isBlocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : null

    if (gated || locked) return { event: 'swipeRevert', stateAccepted: true }

    const solution = carouselUtils.resolveCommit(norm, desc.base.axis)
    if (solution) return {
      direction: solution.direction,
      delta1D: solution.delta,
      stateAccepted: true
    }
    return { event: 'swipeRevert', stateAccepted: true }
  }
}


