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
import type { DragSolution, Runtime } from '../../types/Runtime.types.ts'
import { dragUtils } from './dragUtils.ts'
import type { Computed } from '@interaction/types/computed.types.ts'

export const dragSolver: Partial<
  Record<EventType, (runtime: Runtime, desc: DragDesc, computed: Computed) => DragSolution>
> = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  swipeStart() {
    return { delta: { x: 0, y: 0 }, storeAccepted: true } satisfies DragSolution
  },

  /**
   * Handle swipe (drag) - clamp deltas and return offset reaction
   */
  swipe(runtime, desc) {
    const delta = dragUtils.resolveSwipe(desc.data, runtime.delta)
    return {
      delta,
      storeAccepted: true
    } satisfies DragSolution
  },

  /**
   * Handle swipeCommit - always commit at current position (no revert)
   */
  swipeCommit(runtime, desc) {
    let value = dragUtils.resolveCommit(desc.data, runtime.delta)
    const snap = dragUtils.resolveSnapAdjustment(desc, value)
    if (snap != null) { value = snap }
    return {
      delta: value,
      storeAccepted: true
    } satisfies DragSolution
  }
}