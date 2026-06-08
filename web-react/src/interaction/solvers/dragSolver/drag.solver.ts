// dragSolver.js
/**
 * Drag solver: handles continuous 2D drag movement.
 * 
 * This is exactly like carousel, except:
 * - 2D deltas (x, y) instead of single axis
 * - No commit threshold check (always commits)
 * - No swipeRevert reaction
 */

import { dragUtils } from './drag.utils.ts'
import type { DragSolver } from '@interaction/types/solver.types.ts'


export const dragSolver: DragSolver
  = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart(_runtime, desc) {
    return { routing: "store", solv: { frameRect: desc.base.layout.frameRect } }
  },

  /**
   * Handle swipe (drag) - clamp deltas and return offset reaction
   */
  swipe(runtime, desc) {
    const delta = dragUtils.resolveSwipe(desc.data, runtime.delta)
    return {
      routing: "store", solv: {
        delta
      }
    }
  },

  /**
   * Handle swipeCommit - always commit at current position (no revert)
   */
  swipeCommit(runtime, desc) {
    let value = dragUtils.resolveCommit(desc.data, runtime.delta)
    const snap = dragUtils.resolveSnapAdjustment(desc, value)
    if (snap != null) { value = snap }
    return {
      routing: "store", solv: {
        delta: value,
      }
    }
  }
}