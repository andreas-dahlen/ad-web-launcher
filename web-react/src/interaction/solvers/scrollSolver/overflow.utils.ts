import { vector } from '@interaction/solvers/utils/vector.utils'
import type { ScrollData } from '../../types/descriptor/data.types'
import type { ScrollComputed } from '../../types/runtime/computed.types'
import type { RuntimeStart } from '../../types/runtime/runtime.types'
import type { BaseWithAxis1D, LayoutData } from '../../types/descriptor/base.types'
import { type Axis1D } from '@typing/core.types'

export const overflowUtils = {

  isOverflow(data: ScrollData, runtime: RuntimeStart, axis: Axis1D) {
    //overflow confirmed if not visible.
    if (!data.isVisible) return true
    //overflow disabled if overflowSide is NOT registered
    if (!data.overflowSide) return false
    //If we are at correct start possition we evaluate
    //possibly give this check leeway..
    if (data.settledValue === 0) {
      const dir = vector.getDir(runtime.thresholdValue, axis)
      return vector.isValidDir(dir, data.overflowSide)
      // return vector.isThresholdDirAndoverflowSide(data.overflowSide, axis, runtime.thresholdValue)
    }
    return false
  },

  resolveStart(data: ScrollData, base: BaseWithAxis1D, pointerId: number, isOverflow: boolean) {
    const startValue = data.isVisible ? 0 : base.layout.containerSize.height
    return {
      computedUpdate: {
        pointerId: pointerId,
        isOverflow: isOverflow,
        startOverflowValue: startValue
      }
    }
  },

  resolveSwipe(mainDelta: number, base: BaseWithAxis1D, computed: ScrollComputed) {
    const start = computed.startOverflowValue
    const containerSize = base.layout.containerSize.height
    return { overflowValue: vector.clamp(start + mainDelta, 0, containerSize) }
  },

  resolveSwipeCommit(data: ScrollData, layout: LayoutData, mainDelta: number) {
    const containerSize = layout.containerSize.height
    const isTowardsVisibleDir = mainDelta < 0

    if (!data.isVisible && isTowardsVisibleDir) return {
      overflowValue: 0, isVisible: true
    }

    return { overflowValue: containerSize, isVisible: false }
  },

  resolveSwipeRevert(data: ScrollData, layout: LayoutData) {
    const containerSize = layout.containerSize.height
    return data.isVisible
      ? { overflowValue: 0, isVisible: true }
      : { overflowValue: containerSize, isVisible: false }
  }
}