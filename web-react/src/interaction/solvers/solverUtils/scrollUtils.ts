import { normalizeBase } from '../../solvers/solverUtils/axisUtils.ts'
import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { Normalized1D } from '../../../typeScript/descriptor/ctxType.ts'
import type { ScrollDesc } from '../../../typeScript/descriptor/descriptor.ts'

export const scrollUtils = {

  normalize(desc: ScrollDesc): Normalized1D {
    const { axis } = desc.base
    if (axis === 'both') return {}
    const base = normalizeBase(desc.base, desc.ctx.delta)
    return { mainDelta: base.mainDelta }
  },

  // resolveStart(norm: Normalized1D,
  //   { min, max }: { min: number, max: number }) {

  //   const { mainSize, mainOffset, mainThumbSize } = norm
  //   if (mainSize == null || mainOffset == null || mainThumbSize == null) return
  //   const range = max - min || 1
  //   const usable = mainSize - mainThumbSize
  //   if (!usable) return
  //   const ratio = (mainOffset - mainThumbSize / 2) / usable
  //   const value = min + vector.clamp(ratio, 0, 1) * range
  //   return {
  //     value, valuePerPixel: range / usable
  //   }
  // },

  resolveSwipe(norm: Normalized1D, desc: ScrollDesc) {
    const { mainDelta } = norm
    if (mainDelta == null) return
    const maxScroll = Math.max(0, desc.data.contentSize.height - desc.data.containerSize.height)
    return vector.clamp(desc.data.settledValue + mainDelta, 0, maxScroll)
  }
}