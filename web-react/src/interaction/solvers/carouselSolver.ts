// carouselSolver.js
/**
 * Carousel solver: decides commit vs revert, returns reaction payloads.
 * 
 * Contract:
 * - Receives descriptor from reactionManager
 * - Uses swipePolicy for pure decision logic
 * - Returns minimal reaction payload for dispatcher
 * - Does NOT mutate state directly
 * - Does NOT access DOM
 */
import type { CarouselDesc } from '@interaction/types/descriptor/descriptor.ts'
import { utils } from './solverUtils.ts'
import type { EventType } from '@interaction/types/primitiveType.ts'
import type { CarouselCtxPartial } from '@interaction/types/ctxType.ts'

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
    const norm = utils.normalizeCarousel(desc)
    const gated = utils.resolveGate(norm)
    if (norm.mainDelta == null) return { stateAccepted: false }

    const locked = desc.data.lockSwipeAt
      ? utils.isCarouselBlocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : null

    if (gated || locked) return { stateAccepted: false }
    return { delta1D: norm.mainDelta, stateAccepted: true }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */

  swipeCommit(desc) {
    const norm = utils.normalizeCarousel(desc)
    const gated = utils.resolveGate(norm)

    if (norm.mainDelta == null) return { event: 'swipeRevert', stateAccepted: true }

    const locked = desc.data.lockSwipeAt
      ? utils.isCarouselBlocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : null

    if (gated || locked) return { event: 'swipeRevert', stateAccepted: true }

    const solution = utils.resolveCarouselCommit(norm, desc.base.axis)
    if (solution) return {
      direction: solution.direction,
      delta1D: solution.delta,
      stateAccepted: true
    }
    return { event: 'swipeRevert', stateAccepted: true }
  },
}


