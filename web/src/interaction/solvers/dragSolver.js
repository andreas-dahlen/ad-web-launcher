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

import { vector } from "./vectorUtils"

export const dragSolver = {
  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return {stateAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp deltas and return offset reaction
   */
  swipe(desc) {
    const {delta, dragPosition = { x: 0, y: 0 }, dragConstraints = { min: 0, max: 100 } } = desc
    const clamped = vector.relativeClamp2D(delta, dragPosition, dragConstraints)
    const dx = clamped.x
    const dy = clamped.y
    return { 
      delta: { x: dx, y: dy },
      stateAccepted: true }
  },

  /**
   * Handle swipeCommit - always commit at current position (no revert)
   */
  swipeCommit(desc) {
    const { delta,  dragPosition = { x: 0, y: 0 }, dragConstraints = { min: 0, max: 100 } } = desc
    const finalPos = vector.clamp2D(delta, dragPosition, dragConstraints)
    const {x: fx, y: fy} = finalPos
    const {x: px, y: py} = dragPosition
    const direction = vector.resolveDirection({x:fx - px, y:fy - py})
    return {
      direction: direction,
      delta: { x: fx, y: fy },
      stateAccepted: true }
  }
}
