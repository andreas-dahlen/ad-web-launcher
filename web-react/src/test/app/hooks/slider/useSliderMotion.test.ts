import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSliderMotion } from '@primitives/Slider/hooks/useSliderMotion.hook.ts'

describe('[USE SLIDER MOTION]', () => {
  function renderMotion(
    overrides: Partial<Parameters<typeof useSliderMotion>[0]> = {}
  ) {
    return renderHook(() =>
      useSliderMotion({
        position: 0,
        constraints: {
          min: 0,
          max: 100
        },
        axisSize: 300,
        axisitemSize: 50,
        dragging: false,
        isHorizontal: true,
        ...overrides
      })
    )
  }

  describe('position', () => {
    it('places the thumb at the minimum position', () => {
      const { result } = renderMotion({
        position: 0
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(0px,0,0)'
      )
    })

    it('places the thumb at the maximum position', () => {
      const { result } = renderMotion({
        position: 100
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(250px,0,0)'
      )
    })

    it('positions the thumb proportionally within the usable space', () => {
      const { result } = renderMotion({
        position: 50
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(125px,0,0)'
      )
    })

    it('respects non-zero constraint minimums', () => {
      const { result } = renderMotion({
        position: 75,
        constraints: {
          min: 50,
          max: 100
        }
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(125px,0,0)'
      )
    })
  })

  describe('orientation', () => {
    it('uses the horizontal axis when isHorizontal is true', () => {
      const { result } = renderMotion({
        position: 50,
        isHorizontal: true
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(125px,0,0)'
      )
    })

    it('uses the vertical axis when isHorizontal is false', () => {
      const { result } = renderMotion({
        position: 50,
        isHorizontal: false
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(0,125px,0)'
      )
    })
  })

  describe('usable space', () => {
    it('does not allow negative usable space', () => {
      const { result } = renderMotion({
        position: 50,
        axisSize: 40,
        axisitemSize: 50
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(0px,0,0)'
      )
    })

    it('handles a zero-sized axis', () => {
      const { result } = renderMotion({
        position: 50,
        axisSize: 0,
        axisitemSize: 50
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(0px,0,0)'
      )
    })
  })

  describe('transition', () => {
    it('disables transition while dragging', () => {
      const { result } = renderMotion({
        dragging: true
      })

      expect(result.current.thumbStyle.transition).toBe(
        'none'
      )
    })

    it('uses the motion transition when not dragging', () => {
      const { result } = renderMotion({
        dragging: false
      })

      expect(result.current.thumbStyle.transition).toBe(
        'transform 150ms ease-out'
      )
    })
  })

  describe('constraints', () => {
    it('uses the fallback range when min and max are equal', () => {
      const { result } = renderMotion({
        position: 50,
        constraints: {
          min: 50,
          max: 50
        }
      })

      expect(result.current.thumbStyle.transform).toBe(
        'translate3d(0px,0,0)'
      )
    })
  })
})