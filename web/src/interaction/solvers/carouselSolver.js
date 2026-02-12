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
    const { delta, laneSize } = desc
    const clampedDelta = utils.clamp(delta, laneSize)

    return { 
      delta: clampedDelta,
      stateAccepted: true }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */
  swipeCommit(desc) {
    const { delta, axis, laneSize } = desc
    const clampedDelta = utils.clamp(delta, laneSize)
    console.log('SOLVER LANE:', desc.laneId)
console.log('SOLVER SIZE:', laneSize)
    if (utils.shouldCommit(clampedDelta, laneSize, axis)) {
      const direction = utils.resolveDirection(clampedDelta, axis)
      const targetOffset = utils.getCommitOffset(direction, laneSize)

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


