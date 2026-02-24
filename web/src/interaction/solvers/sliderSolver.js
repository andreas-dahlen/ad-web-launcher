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

export const sliderSolver = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */

  swipeStart(desc) {
    const norm = utils.normalize1D(desc)
    const { value, valuePerPixel }= 
    utils.resolveSliderStart(norm, desc.sliderConstraints)
    // console.log('SWIPESTART: ', resolvedDelta)
    return { 
      delta: value, 
      stateAccepted: true,
      gestureUpdate: {
        sliderStartOffset: value,
        sliderValuePerPixel: valuePerPixel
      }
    }
  },

  /**
   * Handle swipe (drag) - clamp delta so thumb stays within [min, max] visually
   */

  swipe(desc) {
    const norm = utils.normalize1D(desc)
    const gated = utils.resolveGate(norm)
    if (gated) return {stateAccepted: false }
    const value = 
    utils.resolveSliderSwipe(norm, desc, desc.sliderConstraints)
    return { delta: value, stateAccepted: true }
  },

  /**
   * Handle swipeCommit - convert pixel delta to logical delta
   * Clamps result so position stays within [min, max]
   */

  swipeCommit(desc) {
    const norm = utils.normalize1D(desc)
    const gated = utils.resolveGate(norm)
    if (gated) return {stateAccepted: false }

    const value = 
    utils.resolveSliderSwipe(norm, desc)
    // console.log('SWIPECOMMIT: ',resolvedDelta)
    return { delta: value, stateAccepted: true }
  },


  // swipeCommit(desc) {
  //   // const { delta, laneSize, min, max, value } = desc
  //   const { delta,
  //     laneSize, sliderPosition = { x: 0, y: 0 },
  //     sliderConstraints = { min: 0, max: 100 },
  //     axis,
  //     swipeType
  //   } = desc
  //   const { min, max } = sliderConstraints
  //   // Guard against division by zero
  //   if (!laneSize) {

  //     return { delta: sliderPosition, stateAccepted: true }
  //   }

  //   const { primSize, gateSize } = vector.resolveSize(laneSize, axis)

  //   const gateDelta = vector.resolveGateDelta1D(delta, axis, swipeType)
  //   const primaryDelta = vector.resolveDelta1D(delta, axis, swipeType)
  //   if (gateSize != null && Math.abs(gateDelta) > gateSize) {
  //     return { stateAccepted: false }
  //   }

  //   // Convert pixel delta → logical delta
  //   const deltaLogical = (primaryDelta / primSize) * (max - min)
  //   const unclamped = sliderPosition + deltaLogical
  //   const finalValue = vector.clamp(unclamped, min, max)

  //   return { delta: finalValue, stateAccepted: true }
  // }
}
