import { normalizeBase } from '../utils/axisUtils.ts'
import { vector } from '../utils/vectorUtils.ts'
import type { ScrollDesc } from '../../types/descriptor.types.ts'
import type { Vec2 } from '@typing/core.types.ts'
import type { ScrollData } from '@interaction/types/data.types.ts'
import type { BaseWithAxis1D } from '@interaction/types/base.types.ts'


export const scrollUtils = {

  normalize(base: BaseWithAxis1D, delta: Vec2): number | null {
    const basics = normalizeBase(base.grabOffset, base.axis, delta)
    if (basics.mainDelta == null) return null
    return basics.mainDelta
  },

  resolveStart(mainDelta: number, desc: ScrollDesc, isOverflow: boolean) {
    const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
    const raw = desc.data.settledValue - mainDelta
    return {
      delta1D: vector.clamp(raw, 0, maxScroll),
      gestureUpdate: {
        pointerId: desc.base.pointerId,
        isOverflow,
      }
    }
  },

  resolveSwipe(mainDelta: number, data: ScrollData) {
    const maxScroll = Math.max(0, data.contentSize.height - data.containerSize.height)
    const raw = data.settledValue - mainDelta
    return { delta1D: vector.clamp(raw, 0, maxScroll) }
  },


  resolveEnd(mainDelta: number, data: ScrollData) {
    return { ...this.resolveSwipe(mainDelta, data), isVisible: true }
  },
}
