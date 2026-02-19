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
    const { delta, laneSize, axis, swipeType } = desc
    
    const { primSize, gateSize } = utils.resolveSize(laneSize, axis)

    const lockedDelta = utils.resolveDelta1D(delta, axis, swipeType)
    const clampedDelta = utils.clamp(lockedDelta, primSize)
    const gateDelta = utils.resolveGateDelta(delta, axis, swipeType)
    console.log('laneSize: ', desc.laneSize, 'position: ', desc.position, 'constraints: ', desc.constraints)
    if (gateSize != null && Math.abs(gateDelta) > gateSize) {
      return { stateAccepted: false }
    }
    return {
      delta: clampedDelta,
      stateAccepted: true
    }
  },

  /**
   * Handle swipeCommit - decide commit vs revert
   */
  swipeCommit(desc) {
    const { swipeType, delta, axis, laneSize } = desc

    const {primSize} = utils.resolveSize(laneSize, axis)
    const lockedDelta = utils.resolveDelta1D(delta, axis, swipeType)
    const clampedDelta = utils.clamp(lockedDelta, primSize)

    if (utils.shouldCommit(clampedDelta, primSize, axis)) {
      const direction = utils.resolveDirection(clampedDelta, axis)
      const targetOffset = utils.getCommitOffset(direction, primSize)
      return {
        direction: direction,
        delta: targetOffset,
        stateAccepted: true
      }
    }
    // Revert case
    return {
      type: 'swipeRevert',
      stateAccepted: true
    }
  }
}


