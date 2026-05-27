// sliderSolver.js
/**
 * This is exactly like carousel, except:
 * - Quantizes delta to step boundaries on commit
 */

import type { EventType } from '../../typeScript/core/primitiveType.ts'
import type { ScrollDesc } from '../../typeScript/descriptor/descriptor.ts'
import type { ScrollCtxPartial } from '../../typeScript/descriptor/ctxType.ts'
import { scrollUtils } from '@interaction/solvers/solverUtils/scrollUtils.ts'

export const scrollSolver: Partial<Record<EventType, (desc: ScrollDesc) => ScrollCtxPartial>> = {

  //** only happens during scroll. has checks for safety*/
  press(desc) {
    const norm = scrollUtils.normalize(desc)
    if (norm.mainDelta == null || desc.data.isVisible == false) return { storeAccepted: false }
    const result = scrollUtils.resolveScroll(norm.mainDelta, desc)
    return { ...result, storeAccepted: true }
  },

  // 
  swipeStart(desc) {
    const norm = scrollUtils.normalize(desc)
    if (norm.mainDelta == null) return { storeAccepted: false }
    const isOverflow = !!scrollUtils.isOverflow(desc)
    console.log('[SWIPESTART] isOverflow:', isOverflow, 'isVisible:', desc.data.isVisible)
    const result = isOverflow
      ? scrollUtils.resolveOverflowStart(norm.mainDelta, desc)
      : scrollUtils.resolveScroll(norm.mainDelta, desc)
    return {
      ...result,
      storeAccepted: true,
      gestureUpdate: {
        pointerId: desc.base.pointerId,
        isOverflow: isOverflow
      }
    }
  },

  swipe(desc) {
    const norm = scrollUtils.normalize(desc)
    const isOverflow = desc.ctx.gestureUpdate?.isOverflow
    if (isOverflow == null || norm.mainDelta == null) return { storeAccepted: false }
    const result = isOverflow
      ? scrollUtils.resolveOverflow(norm.mainDelta, desc)
      : scrollUtils.resolveScroll(norm.mainDelta, desc)
    return { ...result, storeAccepted: true }
  },

  swipeCommit(desc) {
    const norm = scrollUtils.normalize(desc)
    const isOverflow = desc.ctx.gestureUpdate?.isOverflow
    if (isOverflow == null || norm.mainDelta == null) return { storeAccepted: false }

    const result = isOverflow
      ? scrollUtils.resolveOverflowEnd(norm.mainDelta, desc)
      : scrollUtils.resolveScrollEnd(norm.mainDelta, desc)

    return { ...result, storeAccepted: true }
  },
}

