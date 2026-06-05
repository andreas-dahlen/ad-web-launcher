// scrollSolver.js
/**
 * This is exactly like carousel, except:
 * - Quantizes delta to step boundaries on commit
 */

import type { EventType } from '../../../shared/typing/core.types.ts'
import type { ScrollDesc } from '../../types/descriptor.types.ts'
import type { Runtime, ScrollSolution } from '../../types/Runtime.types.ts'
import { scrollUtils } from './scrollUtils.ts'
import { overflowUtils } from './overflowUtils.ts'
import type { Computed } from '@interaction/types/computed.types.ts'

export const scrollSolver: Partial<
  Record<EventType, (runtime: Runtime, desc: ScrollDesc, computed: Computed) => ScrollSolution>
> = {

  swipeStart(runtime, desc) {
    const delta1d = scrollUtils.normalize(desc.base, runtime.delta)
    if (delta1d == null) return { storeAccepted: false } satisfies ScrollSolution
    const isOverflow = overflowUtils.isOverflow(desc.data, runtime, desc.base.axis)
    return isOverflow
      ? { ...overflowUtils.resolveStart(desc.data, desc.base, desc.base.pointerId, isOverflow), storeAccepted: true } satisfies ScrollSolution
      : { ...scrollUtils.resolveStart(delta1d, desc, isOverflow), storeAccepted: true } satisfies ScrollSolution
  },

  swipe(runtime, desc, computed) {
    const delta1d = scrollUtils.normalize(desc.base, runtime.delta)
    const isOverflow = computed.isOverflow
    if (isOverflow == null || delta1d == null) return { storeAccepted: false } satisfies ScrollSolution
    const result = isOverflow
      ? overflowUtils.resolveSwipe(delta1d, desc.base, computed)
      : scrollUtils.resolveSwipe(delta1d, desc.data, desc.base)
    return { ...result, storeAccepted: true } satisfies ScrollSolution
  },

  swipeCommit(runtime, desc, computed) {
    const delta1d = scrollUtils.normalize(desc.base, runtime.delta)
    const isOverflow = computed.isOverflow
    if (isOverflow == null || delta1d == null) return { storeAccepted: false } satisfies ScrollSolution

    const result = isOverflow
      ? overflowUtils.resolveEnd(delta1d, desc)
      : scrollUtils.resolveEnd(delta1d, desc.data, desc.base)

    return { ...result, storeAccepted: true } satisfies ScrollSolution
  },
}

