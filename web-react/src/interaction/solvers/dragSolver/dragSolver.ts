// dragSolver.js
/**
 * Drag solver: handles continuous 2D drag movement.
 * 
 * This is exactly like carousel, except:
 * - 2D deltas (x, y) instead of single axis
 * - No commit threshold check (always commits)
 * - No swipeRevert reaction
 */
import type { EventType } from '../../../shared/typing/core.types.ts'
import type { DragDesc } from '../../types/descriptor.types.ts'
import type { DragCtxPartial } from '../../types/ctx.types.ts'
import { dragUtils } from './dragUtils.ts'

export const dragSolver: Partial<Record<EventType, (desc: DragDesc) => DragCtxPartial>> = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return { storeAccepted: true }
  },

  /**
   * Handle swipe (drag) - clamp deltas and return offset reaction
   */
  swipe(desc) {
    const delta = dragUtils.resolveSwipe(desc)
    if (typeof delta !== "object") return { storeAccepted: false }
    return {
      delta,
      storeAccepted: true
    }
  },

  /**
   * Handle swipeCommit - always commit at current position (no revert)
   */
  swipeCommit(desc) {
    let value = dragUtils.resolveCommit(desc)
    if (!value) return { storeAccepted: false }
    const snap = dragUtils.resolveSnapAdjustment(desc, value)
    if (snap != null) { value = snap }
    return {
      delta: value,
      storeAccepted: true,
    }
  }
}