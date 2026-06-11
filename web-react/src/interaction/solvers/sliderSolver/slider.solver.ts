// sliderSolver.js
/**
 * This is exactly like carousel, except:
 * - No commit threshold check (always commits)
 * - Quantizes delta to step boundaries on commit
 * - No swipeRevert reaction
 */
import { exceedsCrossRange } from "../utils/axis.utils.ts"
import { sliderUtils } from './slider.utils.ts'
import type { SliderSolver } from '@interaction/types/solver.types.ts'

// export const sliderSolver: Partial<
//   Record<EventType, (runtime: Runtime, desc: SliderDesc, computed: SliderComputed) => SliderSolution>
// > = {

export const sliderSolver: SliderSolver = {

  press(runtime, desc) {
    const norm = sliderUtils.normalize(desc.base, runtime.delta)
    const result = sliderUtils.resolveStart(norm, desc.data.constraints)
    return {
      routing: "store", solv: {
        delta1D: result.value
      }
    }
  },

  swipeStart(runtime, desc) {

    const norm = sliderUtils.normalize(desc.base, runtime.delta)
    const result = sliderUtils.resolveStart(norm, desc.data.constraints)
    return {
      routing: "store", solv: {
        delta1D: result.value,
        computedUpdate: {
          pointerId: desc.base.pointerId,
          sliderStartOffset: result.value,
          sliderValuePerPixel: result.valuePerPixel
        }
      }
    }
  },

  /**
   * Handle swipe (drag) - clamp delta so thumb stays within [min, max] visually
   */
  swipe(runtime, desc, computed) {
    const norm = sliderUtils.normalize(desc.base, runtime.delta)
    const gated = exceedsCrossRange(norm)
    if (gated) return null
    const value =
      sliderUtils.resolveSwipe(norm.mainDelta, desc.data.constraints, computed)
    return {
      routing: "store", solv: { delta1D: value }
    }
  },

  /**
   * Handle swipeCommit - convert pixel delta to logical delta
   * Clamps result so position stays within [min, max]
   */
  swipeCommit(runtime, desc, computed) {
    const norm = sliderUtils.normalize(desc.base, runtime.delta)
    const gated = exceedsCrossRange(norm)
    if (gated) return null

    const value =
      sliderUtils.resolveSwipe(norm.mainDelta, desc.data.constraints, computed)
    return {
      routing: "store", solv: { delta1D: value }
    }
  }
}
