// sliderSolver.js
/**
 * This is exactly like carousel, except:
 * - No commit threshold check (always commits)
 * - Quantizes delta to step boundaries on commit
 * - No swipeRevert reaction
 */
import { exceedsCrossRange } from "../utils/axisUtils.ts"
import type { EventType } from '../../../shared/typing/core.types.ts'
import type { SliderDesc } from '../../types/descriptor.types.ts'
import type { Runtime, SliderSolution } from '../../types/Runtime.types.ts'
import { sliderUtils } from './sliderUtils.ts'
import type { Computed } from '@interaction/types/computed.types.ts'

export const sliderSolver: Partial<
  Record<EventType, (runtime: Runtime, desc: SliderDesc, computed: Computed) => SliderSolution>
> = {

  press(runtime, desc) {
    const norm = sliderUtils.normalize(desc.base, desc.data, runtime.delta)
    const result = sliderUtils.resolveStart(norm, desc.data.constraints)
    if (!result?.value) return { storeAccepted: false } satisfies SliderSolution
    return {
      delta1D: result.value,
      storeAccepted: true
    } satisfies SliderSolution
  },

  swipeStart(runtime, desc) {

    const norm = sliderUtils.normalize(desc.base, desc.data, runtime.delta)
    const result = sliderUtils.resolveStart(norm, desc.data.constraints)
    if (!result?.value) return { storeAccepted: false } satisfies SliderSolution
    console.log("press")
    return {
      delta1D: result?.value,
      storeAccepted: true,
      computedUpdate: {
        pointerId: desc.base.pointerId,
        sliderStartOffset: result?.value,
        sliderValuePerPixel: result?.valuePerPixel
      }
    } satisfies SliderSolution
  },

  /**
   * Handle swipe (drag) - clamp delta so thumb stays within [min, max] visually
   */
  swipe(runtime, desc, computed) {
    const norm = sliderUtils.normalize(desc.base, desc.data, runtime.delta)
    const gated = exceedsCrossRange(norm)
    if (gated || !norm?.mainDelta) return { storeAccepted: false } satisfies SliderSolution
    const value =
      sliderUtils.resolveSwipe(norm.mainDelta, desc.data.constraints, computed)
    if (!value) return { storeAccepted: false } satisfies SliderSolution
    return { delta1D: value, storeAccepted: true } satisfies SliderSolution
  },

  /**
   * Handle swipeCommit - convert pixel delta to logical delta
   * Clamps result so position stays within [min, max]
   */
  swipeCommit(runtime, desc, computed) {
    const norm = sliderUtils.normalize(desc.base, desc.data, runtime.delta)
    const gated = exceedsCrossRange(norm)
    if (gated || !norm?.mainDelta) return { storeAccepted: false } satisfies SliderSolution

    const value =
      sliderUtils.resolveSwipe(norm.mainDelta, desc.data.constraints, computed)
    if (!value) return { storeAccepted: false } satisfies SliderSolution
    return { delta1D: value, storeAccepted: true } satisfies SliderSolution
  }
}
