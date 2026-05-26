// sliderSolver.js
/**
 * This is exactly like carousel, except:
 * - No commit threshold check (always commits)
 * - Quantizes delta to step boundaries on commit
 */

import type { EventType } from '../../typeScript/core/primitiveType.ts'
import type { ScrollDesc } from '../../typeScript/descriptor/descriptor.ts'
import type { ScrollCtxPartial } from '../../typeScript/descriptor/ctxType.ts'
import { scrollUtils } from '@interaction/solvers/solverUtils/scrollUtils.ts'

export const scrollSolver: Partial<Record<EventType, (desc: ScrollDesc) => ScrollCtxPartial>> = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */

  press(desc) {
    const norm = scrollUtils.normalize(desc)
    const result = scrollUtils.resolveScroll(norm, desc)
    if (result == null) return { storeAccepted: false }
    return { ...result, storeAccepted: true }
  },

  swipeStart(desc) {
    const norm = scrollUtils.normalize(desc)
    const result = scrollUtils.resolveScroll(norm, desc)
    if (result == null) return { storeAccepted: false }
    return { ...result, storeAccepted: true }
  },

  swipe(desc) {
    const norm = scrollUtils.normalize(desc)
    const isOverflow = desc.ctx.gestureUpdate?.isOverflow

    if (isOverflow === undefined) {
      const result = scrollUtils.resolveMode(norm, desc)
      if (result == null) return { storeAccepted: false }
      return {
        ...result.value,
        gestureUpdate: {
          pointerId: desc.base.pointerId,
          isOverflow: result.isOverflow
        }
      }
    }

    if (isOverflow) {
      return { ...scrollUtils.resolveScrollOverflow(norm, desc), storeAccepted: true }
    }

    return { ...scrollUtils.resolveScroll(norm, desc), storeAccepted: true }
  },





  swipeCommit(desc) {
    const norm = scrollUtils.normalize(desc)
    const result = desc.ctx.gestureUpdate?.isOverflow
      ? scrollUtils.resolveScrollOverflowEnd(norm, desc)
      : scrollUtils.resolveScroll(norm, desc)

    if (result == null) return { storeAccepted: false }
    return { ...result, storeAccepted: true }
  },
}

