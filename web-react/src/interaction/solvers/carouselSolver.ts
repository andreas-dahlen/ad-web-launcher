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
import { utils } from './solverUtils.ts'

export const carouselSolver: Partial<Record<EventType, (desc: Descriptor) => RuntimePatch | void>> = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return { stateAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp delta and return offset reaction
   */
  swipe(descriptor) {
    const desc = descriptor as CarouselDescriptor
    if (desc.base.type !== 'carousel') throw new Error('suppose to be swipe carousel descriptor but got: ')
    const norm = utils.normalize1D(desc)
    const gated = utils.resolveGate(norm)
    if (norm.mainDelta == null) return

    const locked = desc.data.lockSwipeAt
      ? utils.isCarouselBlocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : null

    if (gated || locked) { return { stateAccepted: false } }
    return { delta1D: norm.mainDelta, stateAccepted: true }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */

  swipeCommit(descriptor) {
    const desc = descriptor as CarouselDescriptor
    if (desc.base.type !== 'carousel') throw new Error('suppose to be swipe carousel descriptor but got: ')
    const norm = utils.normalize1D(desc)
    const gated = utils.resolveGate(norm)

    if (norm.mainDelta == null) return { event: 'swipeRevert', stateAccepted: true }

    const locked = desc.data.lockSwipeAt
      ? utils.isCarouselBlocked(norm.mainDelta, desc.data?.index, desc.data?.lockSwipeAt)
      : null

    if (gated || locked || !desc.base.axis) return { event: 'swipeRevert', stateAccepted: true }

    const solution = utils.resolveCarouselCommit(norm, desc.base.axis)
    if (solution) return {
      direction: solution.direction,
      delta1D: solution.delta,
      stateAccepted: true
    }
    return { event: 'swipeRevert', stateAccepted: true }
  },
}


