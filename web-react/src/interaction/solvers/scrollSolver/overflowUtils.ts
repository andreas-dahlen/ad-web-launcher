import { getCommitOffset } from '@interaction/solvers/utils/axisUtils'
import { vector } from '@interaction/solvers/utils/vectorUtils'
import type { ScrollData } from '@interaction/types/data.types'
import type { Computed } from '@interaction/types/computed.types'
import type { ScrollDesc } from '@interaction/types/descriptor.types'
import type { Runtime } from '@interaction/types/Runtime.types'
import type { Axis1D, Direction } from '@typing/core.types'
import type { BaseWithAxis1D, LayoutData } from '@interaction/types/base.types'

export const overflowUtils = {

  isOverflow(data: ScrollData, runtime: Runtime, axis: Axis1D) {
    if (!data.isVisible) return true
    if (!data.onEdgeDir || !runtime.thresholdValue || data.settledValue !== 0) return false
    return vector.isThresholdDirAndOnEdgeDir(data.onEdgeDir, axis, runtime.thresholdValue)
  },

  resolveStart(data: ScrollData, base: BaseWithAxis1D, pointerId: number, isOverflow: boolean) {
    const startValue = data.isVisible ? 0 : base.layout.containerSize.height
    return {
      //could return resolveSwipe but omition is fine aswell i guess... only one frame xD
      computedUpdate: {
        pointerId: pointerId,
        isOverflow: isOverflow,
        startOverflowValue: startValue
      }
    }
  },

  resolveSwipe(mainDelta: number, base: BaseWithAxis1D, computed: Computed) {
    const start = computed.startOverflowValue ?? 0
    const containerSize = base.layout.containerSize.height
    return { overflowValue: -vector.clamp(start + mainDelta, 0, containerSize) }
  },

  resolveEnd(mainDelta: number, desc: ScrollDesc) {
    const { base, data } = desc
    return vector.shouldCommit(mainDelta, base.layout.containerSize.height, base.axis)
      ? this.resolveSwipeCommit(data, base, base.axis)
      : this.resolveSwipeRevert(data, base.layout)
  },

  resolveSwipeCommit(data: ScrollData, base: BaseWithAxis1D, axis: Axis1D) {
    const containerSize = base.layout.containerSize.height
    if (!data.onEdgeDir) return null
    const direction = { axis, dir: data.onEdgeDir } as Direction
    const distance = getCommitOffset(direction, containerSize)
    if (!data.isVisible) return {
      overflowValue: 0, isVisible: true
    }
    return { overflowValue: distance, isVisible: false }
  },

  resolveSwipeRevert(data: ScrollData, layout: LayoutData) {
    const containerSize = layout.containerSize.height
    return data.isVisible
      ? { overflowValue: 0, isVisible: true }
      : { overflowValue: -containerSize, isVisible: false }
  }
}