import { getCommitOffset } from '@interaction/solvers/solverUtils/axisUtils'
import { vector } from '@interaction/solvers/solverUtils/vectorUtils'
import type { Direction } from '@typeScript/core/primitiveType'
import type { ScrollDesc } from '@typeScript/descriptor/descriptor'

export const overflowUtils = {

  isOverflow(desc: ScrollDesc) {
    if (!desc.data.isVisible) return true
    if (!desc.data.onEdgeDir || !desc.ctx.thresholdValue || desc.data.settledValue !== 0) return false
    return vector.isThresholdDirAndOnEdgeDir(desc.data.onEdgeDir, desc.base.axis, desc.ctx.thresholdValue)
  },

  resolveStart(desc: ScrollDesc, isOverflow: boolean) {
    const startValue = desc.data.isVisible ? 0 : desc.data.containerSize.height
    return {
      //could return resolveSwipe but omition is fine aswell i guess... only one frame xD
      gestureUpdate: {
        pointerId: desc.base.pointerId,
        isOverflow: isOverflow,
        startOverflowValue: startValue
      }
    }
  },

  resolveSwipe(mainDelta: number, desc: ScrollDesc) {
    const start = desc.ctx.gestureUpdate?.startOverflowValue ?? 0
    const containerSize = desc.data.containerSize.height
    return { overflowValue: -vector.clamp(start + mainDelta, 0, containerSize) }
  },

  resolveEnd(mainDelta: number, desc: ScrollDesc) {
    return vector.shouldCommit(mainDelta, desc.data.containerSize.height, desc.base.axis)
      ? this.resolveSwipeCommit(desc)
      : this.resolveSwipeRevert(desc)
  },

  resolveSwipeCommit(desc: ScrollDesc) {
    const containerSize = desc.data.containerSize.height
    if (!desc.data.onEdgeDir) return null
    const direction = { axis: desc.base.axis, dir: desc.data.onEdgeDir } as Direction
    const distance = getCommitOffset(direction, containerSize)
    if (!desc.data.isVisible) return {
      overflowValue: 0, isVisible: true
    }
    return { overflowValue: distance, isVisible: false }
  },

  resolveSwipeRevert(desc: ScrollDesc) {
    const containerSize = desc.data.containerSize.height
    return desc.data.isVisible
      ? { overflowValue: 0, isVisible: true }
      : { overflowValue: -containerSize, isVisible: false }
  }
}