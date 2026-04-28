import { normalizeBase } from '../../solvers/solverUtils/axisUtils.ts'
import { vector } from '../../solvers/solverUtils/vectorUtils.ts'
import type { Normalized1D } from '../../../typeScript/descriptor/ctxType.ts'
import type { SliderDesc } from '../../../typeScript/descriptor/descriptor.ts'

export const sliderUtils = {

  normalize(desc: SliderDesc): Normalized1D {
    const { axis } = desc.base
    if (axis === 'both') return {}
    const base = normalizeBase(desc.base, desc.ctx.delta)
    const track = vector.resolveByAxis1D(desc.data.size, axis)
    const thumb = vector.resolveByAxis1D(desc.data.thumbSize, axis)
    return {
      ...base,
      mainSize: track?.main,
      crossSize: track?.cross,
      mainThumbSize: thumb?.main,
      crossThumbSize: thumb?.cross
    }
  },

  resolveStart(norm: Normalized1D,
    { min, max }: { min: number, max: number }) {

    const { mainSize, mainOffset, mainThumbSize } = norm
    if (mainSize == null || mainOffset == null || mainThumbSize == null) return
    const range = max - min || 1
    const usable = mainSize - mainThumbSize
    if (!usable) return
    const ratio = (mainOffset - mainThumbSize / 2) / usable
    const value = min + vector.clamp(ratio, 0, 1) * range
    return {
      value, valuePerPixel: range / usable
    }
  },

  resolveSwipe(norm: Normalized1D, desc: SliderDesc) {
    const update = desc.ctx.gestureUpdate
    if (!update) return
    const pixel = update.sliderValuePerPixel
    const offset = update.sliderStartOffset

    const { constraints: { min, max } } = desc.data
    const mainDelta = norm.mainDelta

    if (mainDelta == null ||
      pixel == null ||
      offset == null
    ) return

    const nextValue = offset + mainDelta * pixel
    return vector.clamp(nextValue, min, max)
  }
}