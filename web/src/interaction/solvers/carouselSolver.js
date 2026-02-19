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
    return {stateAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp delta and return offset reaction
   */
  swipe(desc) {
    const { delta, laneSize, axis, swipeType } = desc
    const lockedDelta = utils.resolveDelta1D(delta, axis, swipeType)
    const primarySize = utils.resolveSize(laneSize)
    const clampedDelta = utils.clamp(lockedDelta, primarySize)

    return { 
      delta: clampedDelta,
      stateAccepted: true }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */
  swipeCommit(desc) {
    const { swipeType, delta, axis, laneSize } = desc
        const primarySize = utils.resolveSize(laneSize)
        const lockedDelta = utils.resolveDelta1D(delta, axis, swipeType)
    const clampedDelta = utils.clamp(lockedDelta, primarySize)
    if (utils.shouldCommit(clampedDelta, primarySize, axis)) {
      const direction = utils.resolveDirection(clampedDelta, axis)
      const targetOffset = utils.getCommitOffset(direction, primarySize)

      return { 
        direction: direction,
        delta: targetOffset,
        stateAccepted: true }
    }
    // Revert case
    return { 
      type: 'swipeRevert',
      stateAccepted: true }
  }
}


