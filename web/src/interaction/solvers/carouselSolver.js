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
    desc.reaction = desc.type
    return desc
  },

  /**
   * Handle swipe (drag) - clamp delta and return offset reaction
   */
  swipe(desc) {
    const { delta, laneSize } = desc
    const clampedDelta = utils.clamp(delta, laneSize)

    desc.reaction = desc.type
    desc.delta = clampedDelta
    return desc

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

      desc.reaction = desc.type
      desc.direction = direction
      desc.delta = targetOffset
      return desc
    }
    // Revert case
    desc.reaction = 'swipeRevert'
    return desc
  }
}


