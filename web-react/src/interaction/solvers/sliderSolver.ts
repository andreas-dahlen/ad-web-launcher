// sliderSolver.js
/**
 * This is exactly like carousel, except:
 * - No commit threshold check (always commits)
 * - Quantizes delta to step boundaries on commit
 * - No swipeRevert reaction
 */
import { exceedsCrossRange } from "./solverUtils/axisUtils.ts"
import type { EventType } from '../../typeScript/primitiveType.ts'
import type { SliderDesc } from '../../typeScript/descriptor/descriptor.ts'
import type { SliderCtxPartial } from '../../typeScript/ctxType.ts'
import { sliderUtils } from '../solvers/solverUtils/sliderUtils.ts'

export const sliderSolver: Partial<Record<EventType, (desc: SliderDesc) => SliderCtxPartial>> = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  press(desc) {
    // isSlider(desc)
    if (!desc.data) return { storeAccepted: false }
    const norm = sliderUtils.normalize(desc)
    const result = sliderUtils.resolveStart(norm, desc.data.constraints)
    return {
      delta1D: result?.value,
      storeAccepted: true
    }
  },

  swipeStart(desc) {
    if (!desc.data) return { storeAccepted: false }
    const norm = sliderUtils.normalize(desc)
    const result = sliderUtils.resolveStart(norm, desc.data.constraints)
    return {
      delta1D: result?.value,
      storeAccepted: true,
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
    if (!desc.data) return { storeAccepted: false }
    const norm = sliderUtils.normalize(desc)
    const gated = exceedsCrossRange(norm)
    if (gated) return { storeAccepted: false }
    const value =
      sliderUtils.resolveSwipe(norm, desc)
    return { delta1D: value, storeAccepted: true }
  },

  /**
   * Handle swipeCommit - convert pixel delta to logical delta
   * Clamps result so position stays within [min, max]
   */
  swipeCommit(desc) {
    const norm = sliderUtils.normalize(desc)
    const gated = exceedsCrossRange(norm)
    if (gated) return { storeAccepted: false }

    const value =
      sliderUtils.resolveSwipe(norm, desc)
    return { delta1D: value, storeAccepted: true }
  }
}
