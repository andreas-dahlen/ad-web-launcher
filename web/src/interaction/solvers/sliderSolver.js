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

import { utils } from './solverUtils'

export const sliderSolver = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart(desc) {
    desc.reaction = desc.type
    return desc
  },

  /**
   * Handle swipe (drag) - clamp delta so thumb stays within [min, max] visually
   */
  swipe(desc) {
    // const { delta, laneSize, min = 0, max = 100, value = 0 } = desc
    const {delta, laneSize, position, constraints } = desc
    const {min, max} = constraints
    
    const range = max - min
    if (!laneSize || !range) {
      desc.delta = delta
      desc.reaction = desc.type
      return desc
    }
    
    // Calculate valid pixel offset range based on current position
    const maxOffset = ((max - position) / range) * laneSize
    const minOffset = ((min - position) / range) * laneSize
    desc.delta = utils.clamp(delta, minOffset, maxOffset)

    desc.reaction = desc.type
    return desc
  },

  /**
   * Handle swipeCommit - convert pixel delta to logical delta
   * Clamps result so position stays within [min, max]
   */
  swipeCommit(desc) {
    // const { delta, laneSize, min, max, value } = desc
    const {delta, laneSize, position, constraints } = desc
    const {min, max} = constraints
    // Guard against division by zero
    if (!laneSize) {
      desc.delta = position
      desc.reaction = desc.type
      return desc
    }
    
    // Convert pixel delta → logical delta
  const deltaLogical = (delta / laneSize) * (max - min)
  const unclamped = position + deltaLogical
  const finalValue = utils.clamp(unclamped, min, max )

  desc.delta = finalValue   // ← FINAL VALUE
  desc.reaction = desc.type
  return desc
  }
}
