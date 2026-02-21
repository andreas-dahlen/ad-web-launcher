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
import { vector } from './vectorUtils'

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
    const { delta, laneSize, axis, swipeType, startOffset } = desc
    const { primSize, gateSize } = vector.resolveSize(laneSize, axis)

    const gateStart1D = vector.resolveGateDelta1D(startOffset, axis, swipeType)
    const gateDelta1D = vector.resolveGateDelta1D(delta, axis, swipeType)
    
    const currentPos = gateDelta1D + gateStart1D
    const outOfBounds = currentPos < 0 || currentPos > gateSize
    if (outOfBounds) return { stateAccepted: false }
    
    const lockedDelta = vector.resolveDelta1D(delta, axis, swipeType)
    const clampedDelta = vector.clamp(lockedDelta, primSize)
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

    const {primSize} = vector.resolveSize(laneSize, axis)
    const lockedDelta = vector.resolveDelta1D(delta, axis, swipeType)
    const clampedDelta = vector.clamp(lockedDelta, primSize)

    if (utils.shouldCommit(clampedDelta, primSize, axis)) {
      const direction = vector.resolveDirection(clampedDelta, axis)
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


