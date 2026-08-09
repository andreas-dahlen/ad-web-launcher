import { describe, expect, it, vi } from 'vitest'
import { sizeStore } from '../../../shared/state/stores/size.store'
import { APP_CONFIG } from '@config/app.config'
import { gestureUtils } from '@interaction/input/gesture.utils'
import { testGestureUtils } from '@test/testAPI'
import { createButtonDesc, createCarouselDesc, createSliderDesc } from '@test/builders/desc.factory'
import { createBaseWithAxis1D } from '@test/builders/base.factory'
import { createPressCapabilities } from '@test/builders/capabilities.factory'


function mockDeviceSize(width = 400, height = 800) {
  const current = sizeStore.getState()

  const mockValue = {
    ...current,
    device: {
      width: width,
      height: height,
      density: 0
    }
  }

  vi.spyOn(sizeStore, 'getState').mockReturnValue(mockValue)

  return mockValue.device
}

describe('[GESTUREUTILS]', () => {
  describe('[swipeThresholdCalc]', () => {
    it('returns true if instantSwipe is true', () => {
      expect(gestureUtils.swipeThresholdCalc(0, true)).toBe(true)
    })

    it('returns false below threshold', () => {
      mockDeviceSize(400, 800)

      const threshold =
        Math.min(400, 800) * APP_CONFIG.swipeThresholdRatio

      expect(
        gestureUtils.swipeThresholdCalc(threshold - 1, false)
      ).toBe(false)
    })

    it('returns false when distance is below threshold', () => {
      const device = mockDeviceSize(400, 800)
      const screenSize = Math.min(device.width, device.height)
      const threshold = screenSize * APP_CONFIG.swipeThresholdRatio

      expect(
        gestureUtils.swipeThresholdCalc(threshold - 1, false)
      ).toBe(false)
    })

    it('returns true at threshold', () => {
      mockDeviceSize(400, 800)

      const threshold =
        Math.min(400, 800) * APP_CONFIG.swipeThresholdRatio

      expect(
        gestureUtils.swipeThresholdCalc(threshold, false)
      ).toBe(true)
    })

    it('returns true above threshold', () => {
      mockDeviceSize(400, 800)

      const threshold =
        Math.min(400, 800) * APP_CONFIG.swipeThresholdRatio

      expect(
        gestureUtils.swipeThresholdCalc(threshold + 1, false)
      ).toBe(true)
    })
  })
  describe('[isAxisSupported]', () => {
    it('returns true for axis: both', () => {
      expect(
        testGestureUtils.isAxisSupported(
          'horizontal',
          'both'
        )
      ).toBe(true)
    })
    it('returns true for equality in axies', () => {
      expect(
        testGestureUtils.isAxisSupported(
          'horizontal',
          'horizontal'
        )
      ).toBe(true)
    })
    it('returns false for axis not being same', () => {
      expect(
        testGestureUtils.isAxisSupported(
          'horizontal',
          'vertical'
        )
      ).toBe(false)
    })
  })

  describe('[asSwipeableDescriptor]', () => {
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
          isPressable: true,
          isSwipeable: true,
          isInstantSwipe: true
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

})