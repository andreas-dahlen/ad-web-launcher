import { normalizeBase } from '../../solvers/solverUtils/axisUtils.ts'
import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { ScrollDesc } from '../../../typeScript/descriptor/descriptor.ts'


export const scrollUtils = {

  normalize(desc: ScrollDesc): number | null {
    const base = normalizeBase(desc.base, desc.ctx.delta)
    if (base.mainDelta == null) return null
    return base.mainDelta
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
