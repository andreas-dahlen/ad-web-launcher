import { assertScrollComputed, assertSliderComputed, toAxis, toOverflowSide, toType } from '@interaction/assertions/assertions'
import { describe, expect, it } from 'vitest'


describe('[ASSERTIONS]', () => {
  describe('toAxis', () => {
    it('accepts horizontal', () => {
      expect(toAxis('horizontal')).toBe('horizontal')
    })

    it('accepts vertical', () => {
      expect(toAxis('vertical')).toBe('vertical')
    })

    it('accepts both', () => {
      expect(toAxis('both')).toBe('both')
    })

    it('returns null for undefined', () => {
      expect(toAxis(undefined)).toBeNull()
    })

    it('returns null for an invalid value', () => {
      expect(toAxis('diagonal')).toBeNull()
    })
  })

  describe('toType', () => {
    it('accepts button', () => {
      expect(toType('button')).toBe('button')
    })

    it('accepts carousel', () => {
      expect(toType('carousel')).toBe('carousel')
    })

    it('accepts slider', () => {
      expect(toType('slider')).toBe('slider')
    })

    it('accepts drag', () => {
      expect(toType('drag')).toBe('drag')
    })

    it('accepts scroll', () => {
      expect(toType('scroll')).toBe('scroll')
    })

    it('returns null for undefined', () => {
      expect(toType(undefined)).toBeNull()
    })

    it('returns null for an invalid value', () => {
      expect(toType('unknown')).toBeNull()
    })
  })

  describe('toOverflowSide', () => {
    it('accepts left', () => {
      expect(toOverflowSide('left')).toBe('left')
    })

    it('accepts right', () => {
      expect(toOverflowSide('right')).toBe('right')
    })

    it('accepts top', () => {
      expect(toOverflowSide('top')).toBe('top')
    })

    it('accepts bottom', () => {
      expect(toOverflowSide('bottom')).toBe('bottom')
    })

    it('returns null for undefined', () => {
      expect(toOverflowSide(undefined)).toBeNull()
    })

    it('returns null for an invalid value', () => {
      expect(toOverflowSide('center')).toBeNull()
    })
  })

  describe('assertSliderComputed', () => {
    it('accepts slider computed data', () => {
      const computed = {
        sliderStartOffset: 100,
        sliderValuePerPixel: 2
      }

      expect(() => assertSliderComputed(computed)).not.toThrow()
    })

    it('throws when computed is null', () => {
      expect(() => assertSliderComputed(null)).toThrow(
        'computed is required for slider'
      )
    })
  })

  describe('assertScrollComputed', () => {
    it('accepts scroll computed data', () => {
      const computed = {
        isOverflow: true,
        startOverflowValue: 100
      }

      expect(() => assertScrollComputed(computed)).not.toThrow()
    })

    it('throws when computed is null', () => {
      expect(() => assertScrollComputed(null)).toThrow(
        'computed is required for scroll'
      )
    })
  })
})