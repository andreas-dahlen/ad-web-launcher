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

import type { EventType } from '@interaction/types/primitives.ts'
import { utils } from "./solverUtils.ts"
import type { Descriptor } from '@interaction/types/descriptor.ts'
import type { DragSolutions } from '@interaction/types/solutions.ts'
import { isDrag } from '@interaction/types/gestureTypeGuards.ts'

export const dragSolver: Partial<Record<EventType, (desc: Descriptor) => DragSolutions | void>> = {

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
    isDrag(desc)
    const delta = utils.resolveDragSwipe(desc)
    if (typeof delta !== "object") return
    return {
      delta,
      stateAccepted: true
    }
  },

  /**
   * Handle swipeCommit - always commit at current position (no revert)
   */
  swipeCommit(desc) {
    isDrag(desc)
    let value = utils.resolveDragCommit(desc)
    if (!value) return
    const snap = utils.resolveSnapAdjustment(desc, value)
    if (snap != null) { value = snap }
    const direction = utils.resolveDragDirection(desc.base.axis, desc.data.position, value)
    return {
      delta: value,
      stateAccepted: true,
      direction: direction
    }
  }
}