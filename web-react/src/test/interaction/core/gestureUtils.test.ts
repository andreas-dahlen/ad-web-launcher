import { gestureUtils } from '@interaction/core/gestureUtils'
import { createBaseSwipe } from '@test/fixtures/base'
import { createButtonDesc, createCarouselDesc, createSliderDesc } from '@test/fixtures/desc'
import { describe, expect, it } from 'vitest'

describe('gestureUtils', () => {

  describe('resolveAxis', () => {
    it('returns true for axis: both', () => {
      expect(
        gestureUtils.isAxisSupported(
          'horizontal',
          'both'
        )
      ).toBe(true)
    })
    it('returns true for equality in axies', () => {
      expect(
        gestureUtils.isAxisSupported(
          'horizontal',
          'horizontal'
        )
      ).toBe(true)
    })
    it('returns false for axis not being same', () => {
      expect(
        gestureUtils.isAxisSupported(
          'horizontal',
          'vertical'
        )
      ).toBe(false)
    })
  })

  describe('isSwipeableDescriptor', () => {
    it('returns false for button desc', () => {
      const desc = createButtonDesc()
      expect(
        gestureUtils.isSwipeableDescriptor(
          desc,
          'horizontal'
        )
      ).toBe(false)
    })
    it('returns true for slider desc', () => {
      const desc = createSliderDesc()
      expect(
        gestureUtils.isSwipeableDescriptor(
          desc,
          'horizontal'
        )
      ).toBe(true)
    })
    it('returns false for non-matching axises', () => {
      const desc = createCarouselDesc({
        base: { ...createBaseSwipe(), axis: 'vertical' }
      })
      expect(
        gestureUtils.isSwipeableDescriptor(
          desc,
          'horizontal'
        )
      ).toBe(false)
    })
    it('returns false when swipeable capability is false', () => {
      const desc = createCarouselDesc({
        base: { ...createBaseSwipe(), axis: 'horizontal' },
        capabilities: {
          pressable: true,
          swipeable: false,
          instantSwipe: false
        }
      })
      expect(
        gestureUtils.isSwipeableDescriptor(
          desc,
          'horizontal'
        )
      ).toBe(false)
    })
    it('returns true when instantSwipe & swipeable is true', () => {
      const desc = createCarouselDesc({
        base: { ...createBaseSwipe(), axis: 'horizontal' },
        capabilities: {
          pressable: true,
          swipeable: true,
          instantSwipe: true
        }
      })
      expect(
        gestureUtils.isSwipeableDescriptor(
          desc,
          'vertical'
        )
      ).toBe(true)
    })
  })

  describe('swipeThresholdCalc', () => {
    it('returns true if instantSwipe is true', () => {
      expect(gestureUtils.swipeThresholdCalc(5, true)).toBe(true)
    })
  })
})