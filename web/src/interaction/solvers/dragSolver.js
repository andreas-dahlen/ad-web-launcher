// dragSolver.js
/**
 * Drag solver: handles continuous 2D drag movement.
 * 
 * Contract:
 * - Receives descriptor from reactionManager
 * - Uses dragPolicy for pure decision logic
 * - Returns minimal reaction payload for dispatcher
 * - Does NOT mutate state directly
 * - Does NOT access DOM
 * 
 * This is exactly like carousel, except:
 * - 2D deltas (x, y) instead of single axis
 * - No commit threshold check (always commits)
 * - No swipeRevert reaction
 */

// import {
//   clampDelta2D,
//   resolveDirection,
//   clampCommitPosition
// } from './policy/dragPolicy'

import { utils } from './solverUtils'

export const dragSolver = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart(desc) {
    desc.reaction = desc.type
    return desc
  },

  /**
   * Handle swipe (drag) - clamp deltas and return offset reaction
   */
  swipe(desc) {
    const {delta, position, constraints } = desc
    const clamped = utils.relativeClamp2D(delta, position, constraints)
    desc.reaction = desc.type
    desc.delta.x = clamped.x
    desc.delta.y = clamped.y
    return desc
  },

  /**
   * Handle swipeCommit - always commit at current position (no revert)
   */
  swipeCommit(desc) {
    const {delta, constraints, position} = desc
    const finalPos = utils.clamp2D(delta, position, constraints)
    const {x: fx, y: fy} = finalPos
    const {x: px, y: py} = position

    const direction = utils.resolveDirection({x:fx - px, y:fy - py})

    desc.reaction = desc.type
    desc.direction = direction
    desc.delta.x = fx
    desc.delta.y = fy
    return desc
  }
}
