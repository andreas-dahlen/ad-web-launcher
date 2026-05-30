// scrollSolver.js
/**
 * This is exactly like carousel, except:
 * - Quantizes delta to step boundaries on commit
 */

import type { EventType } from '../../../shared/typing/core.types.ts'
import type { ScrollDesc } from '../../types/descriptor.types.ts'
import type { ScrollCtxPartial } from '../../types/ctx.types.ts'
import { scrollUtils } from './scrollUtils.ts'
import { overflowUtils } from './overflowUtils.ts'

export const scrollSolver: Partial<Record<EventType, (desc: ScrollDesc) => ScrollCtxPartial>> = {

  swipeStart(desc) {
    const delta1d = scrollUtils.normalize(desc)
    if (delta1d == null) return { storeAccepted: false }
    const isOverflow = overflowUtils.isOverflow(desc)
    return isOverflow
      ? { ...overflowUtils.resolveStart(desc, isOverflow), storeAccepted: true }
      : { ...scrollUtils.resolveStart(delta1d, desc, isOverflow), storeAccepted: true }
  },

  swipe(desc) {
    const delta1d = scrollUtils.normalize(desc)
    const isOverflow = desc.ctx.gestureUpdate?.isOverflow
    if (isOverflow == null || delta1d == null) return { storeAccepted: false }
    const result = isOverflow
      ? overflowUtils.resolveSwipe(delta1d, desc)
      : scrollUtils.resolveSwipe(delta1d, desc)
    return { ...result, storeAccepted: true }
  },

  swipeCommit(desc) {
    const delta1d = scrollUtils.normalize(desc)
    const isOverflow = desc.ctx.gestureUpdate?.isOverflow
    if (isOverflow == null || delta1d == null) return { storeAccepted: false }

    const result = isOverflow
      ? overflowUtils.resolveEnd(delta1d, desc)
      : scrollUtils.resolveEnd(delta1d, desc)

    return { ...result, storeAccepted: true }
  },
}

