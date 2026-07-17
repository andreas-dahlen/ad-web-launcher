import { normalizeBase } from '../utils/axis.utils.ts'
import { vector } from '../utils/vector.utils.ts'
import type { Vec2 } from '../../../shared/types/core.types.ts'
import type { ScrollDesc } from '../../types/descriptor/descriptor.types.ts'
import type { ScrollData } from '../../types/descriptor/data.types.ts'
import type { BaseWithAxis1D } from '../../types/descriptor/base.types.ts'
import type { ScrollCommit } from '../../types/solver.types.ts'


export const scrollUtils = {

  normalize(base: BaseWithAxis1D, delta: Vec2): number {
    const basics = normalizeBase(base.layout.grabOffset, base.axis, delta)
    return basics.mainDelta
  },

  resolveStart(mainDelta: number, desc: ScrollDesc, isOverflow: boolean) {
    const maxScroll = Math.max(0, desc.base.layout.itemSize.height - desc.base.layout.containerSize.height)
    const raw = desc.data.settledValue - mainDelta
    return {
      delta1D: vector.clamp(raw, 0, maxScroll),
      computedUpdate: {
        pointerId: desc.base.pointerId,
        isOverflow,
        startOverflowValue: 0
        //TODO cache maxScroll (why not?)
      }
    }
  },

  resolveSwipe(mainDelta: number, data: ScrollData, base: BaseWithAxis1D) {
    const maxScroll = Math.max(0, base.layout.itemSize.height - base.layout.containerSize.height)
    const raw = data.settledValue - mainDelta
    return { delta1D: vector.clamp(raw, 0, maxScroll) }
  },


  resolveEnd(mainDelta: number, data: ScrollData, base: BaseWithAxis1D): ScrollCommit["payload"] {
    return { ...this.resolveSwipe(mainDelta, data, base), isVisible: true, isOverflow: false }
  },
}
