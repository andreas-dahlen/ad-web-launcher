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
    const { delta, laneSize, axis, swipeType, carouselStartOffset } = desc
    console.log('carouselStartOffset: ', carouselStartOffset)
    const { primSize, gateSize } = utils.resolveSize(laneSize, axis)

    const lockedDelta = utils.resolveDelta1D(delta, axis, swipeType)
    const clampedDelta = utils.clamp(lockedDelta, primSize)

    //these convert to x or y axis
    const gateStart = utils.resolveGateDelta(carouselStartOffset, axis, swipeType)
    const gateAxisDelta = utils.resolveGateDelta(delta, axis, swipeType)

    const gateDelta = gateAxisDelta - gateStart

    const outOfBounds = gateDelta < 0 || gateDelta > gateSize

    if (outOfBounds) return { stateAccepted: false }
    
    // const withinBounds = Math.abs(gateDelta - gateStart) <= gateSize
    // if(!withinBounds) return { stateAccepted: false }

    // console.log('laneSize: ', desc.laneSize, 'position: ', desc.position, 'constraints: ', desc.constraints)
    // console.log('bounds is if this:', Math.abs(gateDelta - gateStart), 'is smaller or equal to this: ', gateSize, '(gateSize)')
    // console.log('gateDelta: ', gateDelta, 'gateStart: ', gateStart)

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


