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

  press(desc) {
    const norm = utils.normalize1D(desc)
    const { value } = utils.resolveSliderStart(norm, desc.slider.constraints)
    return {
      delta: value,
      stateAccepted:true
    }
  },

  swipeStart(desc) {
    const norm = utils.normalize1D(desc)
    const { value, valuePerPixel }= 
    utils.resolveSliderStart(norm, desc.slider.constraints)
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
    utils.resolveSliderSwipe(norm, desc, desc.slider.constraints)
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
    return { delta: value, stateAccepted: true }
  }
}
