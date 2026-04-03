// sliderSolver.js
/**
 * Slider solver: handles quantized 1D slider movement.
 * 
 * Contract:
 * - Receives descriptor from reactionManager
 * - Uses sliderPolicy for pure decision logic
 * - Returns minimal reaction payload for dispatcher
 * - Does NOT mutate state directly
 * - Does NOT access DOM
 * 
 * This is exactly like carousel, except:
 * - No commit threshold check (always commits)
 * - Quantizes delta to step boundaries on commit
 * - No swipeRevert reaction
 */
import type { EventType } from '@interaction/types/primitiveType.ts'
import { utils } from "./solverUtils.ts"
import type { Descriptor } from '@interaction/types/descriptor/descriptor.ts'
import { isSlider } from '@interaction/types/gestureTypeGuards.ts'
import type { CtxPartial } from '@interaction/types/pipelineType.ts'

export const sliderSolver: Partial<Record<EventType, (desc: Descriptor) => CtxPartial>> = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */

  press(desc) {
    isSlider(desc)
    if (!desc.data) return { stateAccepted: false }
    const norm = utils.normalize1D(desc)
    const result = utils.resolveSliderStart(norm, desc.data.constraints)
    return {
      delta1D: result?.value,
      stateAccepted: true
    }
  },

  swipeStart(desc) {
    isSlider(desc)
    if (!desc.data) return { stateAccepted: false }
    const norm = utils.normalize1D(desc)
    const result = utils.resolveSliderStart(norm, desc.data.constraints)
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
    isSlider(desc)
    if (!desc.data) return { stateAccepted: false }
    const norm = utils.normalize1D(desc)
    const gated = utils.resolveGate(norm)
    if (gated) return { stateAccepted: false }
    const value =
      utils.resolveSliderSwipe(norm, desc)
    return { delta1D: value, stateAccepted: true }
  },

  /**
   * Handle swipeCommit - convert pixel delta to logical delta
   * Clamps result so position stays within [min, max]
   */

  swipeCommit(desc) {
    isSlider(desc)
    const norm = utils.normalize1D(desc)
    const gated = utils.resolveGate(norm)
    if (gated) return { stateAccepted: false }

    const value =
      utils.resolveSliderSwipe(norm, desc)
    return { delta1D: value, stateAccepted: true }
  }
}
