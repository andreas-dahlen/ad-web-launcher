import { gestureUtils } from '@interaction/input/gesture.utils'
import { createBaseWithAxis1D } from '@test/builders/base.factory'
import { createPressCapabilities } from '@test/builders/capabilities.factory'
import { createButtonDesc, createCarouselDesc, createSliderDesc } from '@test/builders/desc.factory'
import { describe, expect, it } from 'vitest'

describe('[GESTUREUTILS]', () => {

  describe('[Resolve Axis]', () => {
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

  describe('[isSwipeableDescriptor]', () => {
    it('returns null for button desc', () => {
      const desc = createButtonDesc()
      expect(
        gestureUtils.asSwipeableDescriptor(
          desc,
          'horizontal'
        )
      ).toBe(null)
    })
    it('returns slider desc if axis matching', () => {
      const desc = createSliderDesc()
      expect(
        gestureUtils.asSwipeableDescriptor(
          desc,
          desc.base.axis
        )
      ).toBe(desc)
    })
    it('returns null for non-matching axises', () => {
      const desc = createCarouselDesc()
      expect(
        gestureUtils.asSwipeableDescriptor(
          desc,
          'vertical'
        )
      ).toBe(null)
    })
    it('returns null when swipeable capability is false', () => {
      const desc = createCarouselDesc({
        base: createBaseWithAxis1D(),
        capabilities: createPressCapabilities()
      })
      expect(
        gestureUtils.asSwipeableDescriptor(
          desc,
          'vertical'
        )
      ).toBe(null)
    })
    it('returns true when instantSwipe & swipeable is true', () => {
      const desc = createCarouselDesc({
        base: undefined,
        capabilities: {
          pressable: true,
          swipeable: true,
          instantSwipe: true
        }
      })

      expect(
        gestureUtils.asSwipeableDescriptor(
          desc,
          'vertical'
        )
      ).toBe(desc)
    })
  })

  describe('[swipeThresholdCalc]', () => {
    it('returns true if instantSwipe is true', () => {
      expect(gestureUtils.swipeThresholdCalc(0, true)).toBe(true)
    })
  })
})