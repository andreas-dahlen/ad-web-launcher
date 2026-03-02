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

import { utils } from "./solverUtils"

export const dragSolver = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return { stateAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp deltas and return offset reaction
   */
  swipe(desc) {
    const delta = utils.resolveDragSwipe(desc)
    return {
      delta,
      stateAccepted: true
    }
  },

  /**
   * Handle swipeCommit - always commit at current position (no revert)
   */
  swipeCommit(desc) {
    let value = utils.resolveDragCommit(desc)
    const snap = utils.resolveSnapAdjustment(desc, value)
    if (snap != null) { value = snap }
    const direction = utils.resolveDragDirection(desc.dragPosition, value)
    return {
      direction,
      delta: value,
      stateAccepted: true
    }
  }
}