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
import { utils } from './solverUtils'

export const carouselSolver = {
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
    const norm = utils.normalize1D(desc)
    const gated = utils.resolveGate(norm)
    const locked = utils.isCarouselBlocked(norm.mainDelta, desc.carousel.index, desc.carousel.lockSwipeAt)
    if (gated || locked) { return {stateAccepted: false } }
    return { delta: norm.mainDelta, stateAccepted: true }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */

  swipeCommit(desc) {
    const norm = utils.normalize1D(desc)
    const gated = utils.resolveGate(norm)
    const locked = utils.isCarouselBlocked(norm.mainDelta, desc.carousel.index, desc.carousel.lockSwipeAt)
    if (gated || locked) return {event: 'swipeRevert', stateAccepted: true}

    const solution = utils.resolveCarouselCommit(norm, desc.axis)
    if (solution) return {
      direction: solution.direction,
      delta: solution.delta,
      stateAccepted: true
    }
    return {event: 'swipeRevert', stateAccepted: true}
  },
}


