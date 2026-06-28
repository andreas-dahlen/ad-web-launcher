// scrollSolver.js
/**
 * This is exactly like carousel, except:
 * - Quantizes delta to step boundaries on commit
 */

import { scrollUtils } from './scroll.utils.ts'
import { overflowUtils } from './overflow.utils.ts'
import type { ScrollSolver } from '@interaction/types/solver.types.ts'
import { vector } from '@interaction/solvers/utils/vector.utils.ts'

export const scrollSolver: ScrollSolver = {

  swipeStart(runtime, desc) {
    const delta1d = scrollUtils.normalize(desc.base, runtime.delta)
    const isOverflow = overflowUtils.isOverflow(desc.data, runtime, desc.base.axis)

    if (isOverflow) {
      const result = overflowUtils.resolveStart(desc.data, desc.base, desc.base.pointerId, isOverflow)
      return {
        route: "default",
        payload: { isOverflow: true },
        computedUpdate: result.computedUpdate
      }
    }
    const result = scrollUtils.resolveStart(delta1d, desc, isOverflow)
    return {
      route: "default",
      computedUpdate: result.computedUpdate,
      payload: {
        delta1D: result.delta1D,
        isOverflow: false
      }
    }
  },

  swipe(runtime, desc, computed) {
    const delta1d = scrollUtils.normalize(desc.base, runtime.delta)

    if (computed.isOverflow) {
      const result = overflowUtils.resolveSwipe(delta1d, desc.base, computed)
      return {
        route: "default",
        payload: {
          overflowValue: result.overflowValue,
          isOverflow: true
        }
      }
    }
    const result = scrollUtils.resolveSwipe(delta1d, desc.data, desc.base)
    return {
      route: "default",
      payload: {
        delta1D: result.delta1D,
        isOverflow: false
      }
    }
  },

  swipeCommit(runtime, desc, computed) {
    const delta1d = scrollUtils.normalize(desc.base, runtime.delta)
    const { data, base } = desc
    if (!computed.isOverflow) {
      const result = scrollUtils.resolveEnd(delta1d, data, base)
      return {
        route: "default",
        payload: {
          isVisible: true,
          delta1D: result.delta1D,
          isOverflow: false
        }
      }
    }

    if (!data.overflowSide) throw new Error(`"isOverflow is true in swipeCommit but overflowSide is: ${data.overflowSide}`)

    const toCommit = vector.shouldCommit(delta1d, base.layout.containerSize.height, base.axis)
    //TODO pass whole containerSize for axis solving. needs a overflowUtils function that takes axis and converts it into relevent boolean using the vector function as help...

    const result = toCommit
      ? overflowUtils.resolveSwipeCommit(data, base.layout, delta1d)
      : overflowUtils.resolveSwipeRevert(desc.data, base.layout)

    if (toCommit) {
      return {
        route: "default",
        payload: {
          overflowValue: result.overflowValue,
          isVisible: result.isVisible,
          isOverflow: true
        }
      }
    } else {
      return {
        route: "revert",
        payload: {
          overflowValue: result.overflowValue,
          isVisible: result.isVisible
        }
      }
    }
  }
}
