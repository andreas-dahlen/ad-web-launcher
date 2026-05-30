import { normalizeBase } from '../utils/axisUtils.ts'
import { vector } from '../utils/vectorUtils.ts'
import type { ScrollDesc } from '../../types/descriptor.types.ts'


export const scrollUtils = {

  normalize(desc: ScrollDesc): number | null {
    const base = normalizeBase(desc.base, desc.ctx.delta)
    if (base.mainDelta == null) return null
    return base.mainDelta
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

  resolveSwipe(mainDelta: number, desc: ScrollDesc) {
    const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
    const raw = desc.data.settledValue - mainDelta
    return { delta1D: vector.clamp(raw, 0, maxScroll) }
  },


  resolveEnd(mainDelta: number, desc: ScrollDesc) {
    return { ...this.resolveSwipe(mainDelta, desc), isVisible: true }
  },
}
