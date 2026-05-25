// sliderSolver.js
/**
 * This is exactly like carousel, except:
 * - No commit threshold check (always commits)
 * - Quantizes delta to step boundaries on commit
 * - No swipeRevert reaction
 */

import type { EventType } from '../../typeScript/core/primitiveType.ts'
import type { ScrollDesc } from '../../typeScript/descriptor/descriptor.ts'
import type { ScrollCtxPartial } from '../../typeScript/descriptor/ctxType.ts'
import { scrollUtils } from '@interaction/solvers/solverUtils/scrollUtils.ts'

export const scrollSolver: Partial<Record<EventType, (desc: ScrollDesc) => ScrollCtxPartial>> = {

  /**
   * Handle swipeStart - returns reaction to enable dragging
   */
  press() {
    return { storeAccepted: true }
  },

  swipeStart() {
    return { storeAccepted: true }
  },
  swipe(desc) {
    const norm = scrollUtils.normalize(desc)
    const value = scrollUtils.resolveSwipe(norm, desc)
    if (value == null) return { storeAccepted: false }
    return { delta1D: value, storeAccepted: true }
  },
  swipeCommit(desc) {
    const norm = scrollUtils.normalize(desc)
    const value = scrollUtils.resolveSwipe(norm, desc)
    if (value == null) return { storeAccepted: false }
    return { delta1D: value, storeAccepted: true }
  }
}

