import { normalizeBase } from '../utils/axisUtils.ts'
import { vector } from '../utils/vectorUtils.ts'
import type { Normalized1D } from '../../types/runtime.types.ts'
import type { BaseWithAxis1D } from '@interaction/types/base.types.ts'
import type { SliderConstraints, SliderData } from '@interaction/types/data.types.ts'
import type { SliderComputed } from '@interaction/types/computed.types.ts'
import type { Vec2 } from '@typing/core.types.ts'

export const sliderUtils = {

  normalize(base: BaseWithAxis1D, data: SliderData, delta: Vec2): Normalized1D {
    const basics = normalizeBase(base.layout.grabOffset, base.axis, delta)
    const track = vector.resolveByAxis1D(base.layout.containerSize.width, base.layout.containerSize.height, base.axis)
    const thumb = vector.resolveByAxis1D(base.layout.itemSize.width, base.layout.itemSize.height, base.axis)
    return {
      ...basics,
      mainSize: track.main,
      crossSize: track.cross,
      mainitemSize: thumb.main,
      crossitemSize: thumb.cross
    }
  },

  resolveStart(norm: Normalized1D,
    { min, max }: { min: number, max: number }) {

    const { mainSize, mainOffset, mainitemSize } = norm
    const range = max - min || 1
    const usable = mainSize - mainitemSize
    // if (!usable) return
    const ratio = (mainOffset - mainitemSize / 2) / usable
    const value = min + vector.clamp(ratio, 0, 1) * range
    return {
      value, valuePerPixel: range / usable
    }
  },

  //constraints, computed values... norm.maindelta
  resolveSwipe(delta: number, constraints: SliderConstraints, computed: SliderComputed) {
    const pixel = computed.sliderValuePerPixel
    const offset = computed.sliderStartOffset

    const { min, max } = constraints

    const nextValue = offset + delta * pixel
    return vector.clamp(nextValue, min, max)
  }
}