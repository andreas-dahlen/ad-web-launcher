// sliderSolver.js
/**
 * This is exactly like carousel, except:
 * - No commit threshold check (always commits)
 * - Quantizes delta to step boundaries on commit
 * - No swipeRevert reaction
 */
import type { EventType } from '@interaction/types/primitiveType.ts'
import { resolveGate } from "./solverUtils/utilsShared.ts"
import type { SliderDesc } from '@interaction/types/descriptor/descriptor.ts'
import type { SliderCtxPartial } from '@interaction/types/ctxType.ts'
import { sliderUtils } from '@interaction/solvers/solverUtils/sliderUtils.ts'

export const sliderSolver: Partial<Record<EventType, (desc: SliderDesc) => SliderCtxPartial>> = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  press(desc) {
    // isSlider(desc)
    if (!desc.data) return { stateAccepted: false }
    const norm = sliderUtils.normalize(desc)
    const result = sliderUtils.resolveStart(norm, desc.data.constraints)
    return {
      delta1D: result?.value,
      stateAccepted: true
    }
  },

  swipeStart(desc) {
    if (!desc.data) return { stateAccepted: false }
    const norm = sliderUtils.normalize(desc)
    const result = sliderUtils.resolveStart(norm, desc.data.constraints)
    return {
      delta1D: result?.value,
      stateAccepted: true,
      gestureUpdate: {
        pointerId: desc.base.pointerId,
        sliderStartOffset: result?.value,
        sliderValuePerPixel: result?.valuePerPixel
      }
    }
  },

  /**
   * Handle swipe (drag) - clamp delta so thumb stays within [min, max] visually
   */
  swipe(desc) {
    if (!desc.data) return { stateAccepted: false }
    const norm = sliderUtils.normalize(desc)
    const gated = resolveGate(norm)
    if (gated) return { stateAccepted: false }
    const value =
      sliderUtils.resolveSwipe(norm, desc)
    return { delta1D: value, stateAccepted: true }
  },

  /**
   * Handle swipeCommit - convert pixel delta to logical delta
   * Clamps result so position stays within [min, max]
   */
  swipeCommit(desc) {
    const norm = sliderUtils.normalize(desc)
    const gated = resolveGate(norm)
    if (gated) return { stateAccepted: false }

    const value =
      sliderUtils.resolveSwipe(norm, desc)
    return { delta1D: value, stateAccepted: true }
  }
}
