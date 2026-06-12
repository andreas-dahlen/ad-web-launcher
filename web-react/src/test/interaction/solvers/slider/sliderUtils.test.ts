import { describe, expect, it } from 'vitest';
// import { createSliderInput } from '@test/fixtures/input';
// import { sliderSolver } from '@interaction/solvers/sliderSolver/sliderSolver';
import { createBaseWithAxis1D } from '@test/builders/base.factory';
import { sliderUtils } from '@interaction/solvers/sliderSolver/slider.utils';
import { base_DEFAULT, data_DEFAULT } from '@test/defaults/desc.defaults';
import { createComputedSlider } from '@test/builders/computed.factory';
import type { Normalized1D } from '@interaction/types/solver.types';
import { merge } from '@test/builders/factory.utils';

describe('[SLIDERUTLS]', () => {

  function createNormalizeSliderInput(overrides?: Partial<Normalized1D>) {
    const base = createBaseWithAxis1D()
    const delta = { x: 50, y: 50 }
    const layout = base_DEFAULT.layout
    const norm = sliderUtils.normalize(base, delta)
    return {
      norm: merge(norm, overrides),
      layout
    }
  }
  describe('[Normalize]', () => {
    it('returns valid mainSize', () => {
      const result = createNormalizeSliderInput()
      expect(result.norm.mainSize).toEqual(result.layout.deviceSize.width)
    })
    it('returns valid crossSize', () => {
      const result = createNormalizeSliderInput()
      expect(result.norm.crossSize).toEqual(result.layout.deviceSize.height)
    })
    it('returns valid mainitemSize', () => {
      const result = createNormalizeSliderInput()
      expect(result.norm.mainitemSize).toEqual(result.layout.itemSize.width)
    })
    it('returns valid crossItemSize', () => {
      const result = createNormalizeSliderInput()
      expect(result.norm.crossitemSize).toEqual(result.layout.itemSize.height)
    })
  })

  describe('[Resolve Start]', () => {
    it('resolves correct initial slider value', () => {
      const { norm } = createNormalizeSliderInput()
      const constraints = data_DEFAULT.slider.constraints

      const result = sliderUtils.resolveStart(norm, constraints)
      expect(result.value).toEqual(5.5)
    })
    it('returns valuePerPixel based on range and usable size', () => {
      const { norm } = createNormalizeSliderInput()
      const constraints = data_DEFAULT.slider.constraints

      const result = sliderUtils.resolveStart(norm, constraints)

      expect(result.valuePerPixel)
        .toBe((constraints.max - constraints.min) /
          (norm.mainSize - norm.mainitemSize))
    })
    it('clamps value to min when offset is before the track', () => {
      const { norm } = createNormalizeSliderInput({ mainOffset: -10000 })

      const result = sliderUtils.resolveStart(norm, { min: 0, max: 10 })
      expect(result.value).toBe(0)
    })
    it('clamps value to max when offset is after the track', () => {
      const { norm } = createNormalizeSliderInput({ mainOffset: 10000 })

      const result = sliderUtils.resolveStart(norm, { min: 0, max: 100 })
      expect(result.value).toBe(100)
    })
  })



  describe('[Resolve Swipe]', () => {
    it('returns value', () => {
      const computed = createComputedSlider()
      const delta = 0
      const constraints = data_DEFAULT.slider.constraints
      const result = sliderUtils.resolveSwipe(delta, constraints, computed)
      expect(result).toBe(30)
    })

    it('returns start offset when delta is 0', () => {
      const computed = createComputedSlider()
      const constraints = data_DEFAULT.slider.constraints
      const result = sliderUtils.resolveSwipe(
        0,
        constraints,
        computed
      )

      expect(result).toBe(30)
    })

    it('applies delta using valuePerPixel', () => {
      const computed = createComputedSlider({
        sliderStartOffset: 30,
        sliderValuePerPixel: 3
      })
      const constraints = data_DEFAULT.slider.constraints

      const result = sliderUtils.resolveSwipe(
        5,
        constraints,
        computed
      )
      expect(result).toBe(45)
    })

    it('clamps to min', () => {
      const computed = createComputedSlider({
        sliderStartOffset: 30,
        sliderValuePerPixel: 3
      })
      const constraints = data_DEFAULT.slider.constraints
      const result = sliderUtils.resolveSwipe(
        -100,
        constraints,
        computed
      )

      expect(result).toBe(0)
    })

    it('clamps to max', () => {
      const computed = createComputedSlider({
        sliderStartOffset: 30,
        sliderValuePerPixel: 3
      })
      const constraints = data_DEFAULT.slider.constraints

      const result = sliderUtils.resolveSwipe(
        100,
        constraints,
        computed
      )

      expect(result).toBe(99)
    })
  })
})