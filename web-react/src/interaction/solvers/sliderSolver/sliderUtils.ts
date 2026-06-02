import { normalizeBase } from '../utils/axisUtils.ts'
import { vector } from '../utils/vectorUtils.ts'
import type { Normalized1D } from '../../types/Runtime.types.ts'
import type { SliderDesc } from '../../types/descriptor.types.ts'
import type { BaseWithAxis1D } from '@interaction/types/base.types.ts'
import type { SliderData } from '@interaction/types/data.types.ts'
import type { Vec2 } from '@typing/core.types.ts'

export const sliderUtils = {

  normalize(base: BaseWithAxis1D, data: SliderData, delta: Vec2): Normalized1D {
    const basics = normalizeBase(base.grabOffset, base.axis, delta)
    const track = vector.resolveByAxis1D(data.containerSize.width, data.containerSize.height, base.axis)
    const thumb = vector.resolveByAxis1D(data.thumbSize.width, data.thumbSize.height, base.axis)
    return {
      ...basics,
      mainSize: track.main,
      crossSize: track.cross,
      mainThumbSize: thumb.main,
      crossThumbSize: thumb.cross
    }
  },

  resolveStart(norm: Normalized1D,
    { min, max }: { min: number, max: number }) {

    const { mainSize, mainOffset, mainThumbSize } = norm
    if (mainSize == null || mainOffset == null || mainThumbSize == null) return
    const range = max - min || 1
    const usable = mainSize - mainThumbSize
    // if (!usable) return
    const ratio = (mainOffset - mainThumbSize / 2) / usable
    const value = min + vector.clamp(ratio, 0, 1) * range
    return {
      value, valuePerPixel: range / usable
    }
  },

  //constraints, computed values... norm.maindelta
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