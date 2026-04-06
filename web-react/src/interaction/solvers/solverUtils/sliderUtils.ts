import { normalizeBase } from '@interaction/solvers/solverUtils/utilsShared'
import { vector } from '@interaction/solvers/solverUtils/vectorUtils'
import type { Normalized1D } from '@interaction/types/ctxType'
import type { SliderDesc } from '@interaction/types/descriptor/descriptor'

export const sliderUtils = {

  normalize(desc: SliderDesc): Normalized1D {
    const { axis } = desc.base
    if (axis === 'both') return {}
    const base = normalizeBase(desc.base, desc.ctx.delta)
    const track = vector.resolveByAxis1D(desc.data.size, axis)
    const thumb = vector.resolveByAxis1D(desc.data.thumbSize, axis)
    return {
      ...base,
      mainTrackSize: track?.prim,
      crossTrackSize: track?.sub,
      mainThumbSize: thumb?.prim,
      crossThumbSize: thumb?.sub
    }
  },

  resolveStart(norm: Normalized1D,
    { min, max }: { min: number, max: number }) {

    const { mainTrackSize, mainOffset, mainThumbSize } = norm
    if (mainTrackSize == null || mainOffset == null || mainThumbSize == null) return
    const range = max - min
    const usable = mainTrackSize - mainThumbSize
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