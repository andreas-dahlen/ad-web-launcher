import { vector } from '@interaction/solvers/utils/vector.utils'
import type { ScrollData } from '@interaction/types/data.types'
import type { ScrollComputed } from '@interaction/types/computed.types'
import type { RuntimeStart } from '@interaction/types/runtime.types'
import { type Axis1D } from '@typing/core.types'
import type { BaseWithAxis1D, LayoutData } from '@interaction/types/base.types'

export const overflowUtils = {

  isOverflow(data: ScrollData, runtime: RuntimeStart, axis: Axis1D) {
    //overflow confirmed if not visible.
    if (!data.isVisible) return true
    //overflow disabled if onEdgeDir is NOT registered
    if (!data.onEdgeDir) return false
    //If we are at correct start possition we evaluate
    //possibly give this check leeway..
    if (data.settledValue === 0) {
      const dir = vector.getDir(runtime.thresholdValue, axis)
      return vector.isValidDir(dir, data.onEdgeDir)
      // return vector.isThresholdDirAndOnEdgeDir(data.onEdgeDir, axis, runtime.thresholdValue)
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
    const towardsVisibleDir = mainDelta < 0

    if (!data.isVisible && towardsVisibleDir) return {
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