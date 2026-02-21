// sliderSolver.js
/**
 * Slider solver: handles quantized 1D slider movement.
 * 
 * Contract:
 * - Receives descriptor from reactionManager
 * - Uses sliderPolicy for pure decision logic
 * - Returns minimal reaction payload for dispatcher
 * - Does NOT mutate state directly
 * - Does NOT access DOM
 * 
 * This is exactly like carousel, except:
 * - No commit threshold check (always commits)
 * - Quantizes delta to step boundaries on commit
 * - No swipeRevert reaction
 */
import { utils } from "./solverUtils"
import { vector } from "./vectorUtils"

export const sliderSolver = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return { stateAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp delta so thumb stays within [min, max] visually
   */

  vectorAgnosticSwipe(desc) {
    const gated = utils.resolveGate(desc)
    if (gated) return {stateAccepted: false }
    return { delta: utils.resolveSwipeDelta(desc), stateAccepted: true }
  },

  newSwipe(desc) {
    const { primSize, gateSize } = vector.resolveSize(desc.laneSize, desc.axis)
    const { outOfBounds } = vector.resolveGate(desc, gateSize)
    if (outOfBounds) return { stateAccepted: false }
    
    const { min, max, range, sliderPos } = utils.extractSlider(desc)
    const primDelta = vector.resolveDelta1D(desc.delta, desc.axis, desc.swipeType)
    // Calculate valid pixel offset range based on current position
    const maxOffset = ((max - sliderPos) / range) * primSize
    const minOffset = ((min - sliderPos) / range) * primSize
    const newDelta = vector.clamp(primDelta, minOffset, maxOffset)

    return { delta: newDelta, stateAccepted: true }
  },

  swipe(desc) {
    const { delta, laneSize, axis, swipeType, startOffset,
      sliderPosition,
      sliderConstraints = { min: 0, max: 100 },
    } = desc
    const { min, max } = sliderConstraints
    const range = max - min
    const { primSize, gateSize } = vector.resolveSize(laneSize, axis)

    const gateStart1D = vector.resolveGateDelta1D(startOffset, axis, swipeType)
    const gateDelta1D = vector.resolveGateDelta1D(delta, axis, swipeType)
    
        const currentPos = gateDelta1D + gateStart1D
    const outOfBounds = currentPos < 0 || currentPos > gateSize
    if (outOfBounds) return { stateAccepted: false }
    
    const primaryDelta = vector.resolveDelta1D(delta, axis, swipeType)
    // Calculate valid pixel offset range based on current position
    const maxOffset = ((max - sliderPosition) / range) * primSize
    const minOffset = ((min - sliderPosition) / range) * primSize
    const newDelta = vector.clamp(primaryDelta, minOffset, maxOffset)

    return { delta: newDelta, stateAccepted: true }
  },

  /**
   * Handle swipeCommit - convert pixel delta to logical delta
   * Clamps result so position stays within [min, max]
   */
  swipeCommit(desc) {
    // const { delta, laneSize, min, max, value } = desc
    const { delta,
      laneSize, sliderPosition = { x: 0, y: 0 },
      sliderConstraints = { min: 0, max: 100 },
      axis,
      swipeType
    } = desc
    const { min, max } = sliderConstraints
    // Guard against division by zero
    if (!laneSize) {

      return { delta: sliderPosition, stateAccepted: true }
    }

    const { primSize, gateSize } = vector.resolveSize(laneSize, axis)

    const gateDelta = vector.resolveGateDelta1D(delta, axis, swipeType)
    const primaryDelta = vector.resolveDelta1D(delta, axis, swipeType)
    if (gateSize != null && Math.abs(gateDelta) > gateSize) {
      return { stateAccepted: false }
    }

    // Convert pixel delta → logical delta
    const deltaLogical = (primaryDelta / primSize) * (max - min)
    const unclamped = sliderPosition + deltaLogical
    const finalValue = vector.clamp(unclamped, min, max)

    return { delta: finalValue, stateAccepted: true }
  }
}
