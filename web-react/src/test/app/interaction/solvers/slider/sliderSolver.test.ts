import { describe, expect, it } from 'vitest'

import { sliderSolver } from '@interaction/solvers/sliderSolver/slider.solver.ts'
import {
  createInterpreterPress,
  createInterpreterSwipe,
  createInterpreterSwipeCommit,
  createInterpreterSwipeStart,
} from '@test/app/interaction/builders/input.factory.ts'
import { createComputedSlider } from '@test/app/interaction/builders/computed.factory.ts'
import type { SliderDesc } from '@interaction/types/descriptor/descriptor.types.ts'


function assertSliderDesc(
  desc: unknown
): asserts desc is SliderDesc {
  expect(desc).toHaveProperty('type', 'slider')
}


describe('[SLIDERSOLVER]', () => {

  describe('[Press]', () => {

    it('returns the resolved slider value', () => {
      const { runtime, desc } = createInterpreterPress('slider')
      assertSliderDesc(desc)

      const result = sliderSolver.press(runtime, desc)

      expect(result.payload.delta1D).toBe(5.5)
    })

  })


  describe('[SwipeStart]', () => {

    it('returns the resolved slider value and computed state', () => {
      const { runtime, desc } = createInterpreterSwipeStart('slider')
      assertSliderDesc(desc)

      const result = sliderSolver.swipeStart(runtime, desc)

      expect(result.payload.delta1D).toBe(5.5)

      expect(result.computedUpdate).toEqual({
        pointerId: 1,
        sliderStartOffset: 5.5,
        sliderValuePerPixel: 1.1,
      })
    })

  })


  describe('[Swipe]', () => {

    it('returns the resolved slider value', () => {
      const { runtime, desc } = createInterpreterSwipe('slider')
      assertSliderDesc(desc)

      const result = sliderSolver.swipe(
        runtime,
        desc,
        createComputedSlider()
      )

      expect(result).not.toBeNull()
      expect(result?.payload.delta1D).toBe(99)
    })

    it('returns null when cross-axis range is exceeded', () => {
      const { runtime, desc } = createInterpreterSwipe('slider', {
        runtime: {
          delta: { x: 100, y: 1000 },
        },
      })

      assertSliderDesc(desc)

      const result = sliderSolver.swipe(
        runtime,
        desc,
        createComputedSlider()
      )

      expect(result).toBeNull()
    })

  })


  describe('[SwipeCommit]', () => {

    it('returns the resolved slider value', () => {
      const { runtime, desc } = createInterpreterSwipeCommit('slider')
      assertSliderDesc(desc)

      const result = sliderSolver.swipeCommit(
        runtime,
        desc,
        createComputedSlider()
      )

      expect(result).not.toBeNull()
      expect(result?.payload.delta1D).toBe(99)
    })

    it('returns null when cross-axis range is exceeded', () => {
      const { runtime, desc } = createInterpreterSwipeCommit('slider', {
        runtime: {
          delta: { x: 100, y: 1000 },
        },
      })

      assertSliderDesc(desc)

      const result = sliderSolver.swipeCommit(
        runtime,
        desc,
        createComputedSlider()
      )

      expect(result).toBeNull()
    })

  })

})