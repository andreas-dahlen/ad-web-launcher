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
  swipeStart(desc) {
    return {...desc, stateAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp delta and return offset reaction
   */
  swipe(desc) {
    const { delta, laneSize } = desc
    const clampedDelta = utils.clamp(delta, laneSize)

    return {...desc, 
      delta: clampedDelta,
      stateAccepted: true }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */
  swipeCommit(desc) {
    const { delta, axis, laneSize } = desc
    const clampedDelta = utils.clamp(delta, laneSize)

    if (utils.shouldCommit(clampedDelta, laneSize, axis)) {
      const direction = utils.resolveDirection(clampedDelta, axis)
      const targetOffset = utils.getCommitOffset(direction, laneSize)

      return {...desc, 
        direction: direction,
        delta: targetOffset,
        stateAccepted: true }
    }
    // Revert case
    return {...desc, 
      type: 'swipeRevert',
      stateAccepted: true }
  }
}


