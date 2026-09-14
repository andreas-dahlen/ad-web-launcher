import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useDragMotion } from '@primitives/Drag/hooks/useDragMotion.hook.ts'

import { Z } from '@config/zIndex.config.ts'

describe('[USE DRAG MOTION]', () => {
  function renderMotion(
    overrides: Partial<Parameters<typeof useDragMotion>[0]> = {}
  ) {
    return renderHook(() =>
      useDragMotion({
        settledOffset: { x: 0, y: 0 },
        liveOffset: { x: 0, y: 0 },
        dragging: false,
        ...overrides
      })
    )
  }

  describe('transform', () => {
    it('uses the settled offset when there is no live offset', () => {
      const { result } = renderMotion({
        settledOffset: { x: 100, y: 50 }
      })

      expect(result.current.motionStyle.transform).toBe(
        'translate3d(100px, 50px, 0)'
      )
    })

    it('uses the live offset when there is no settled offset', () => {
      const { result } = renderMotion({
        liveOffset: { x: 25, y: 75 }
      })

      expect(result.current.motionStyle.transform).toBe(
        'translate3d(25px, 75px, 0)'
      )
    })

    it('combines settled and live offsets', () => {
      const { result } = renderMotion({
        settledOffset: { x: 100, y: 50 },
        liveOffset: { x: 25, y: -10 }
      })

      expect(result.current.motionStyle.transform).toBe(
        'translate3d(125px, 40px, 0)'
      )
    })

    it('defaults missing offset values to zero', () => {
      const { result } = renderMotion({
        settledOffset: { x: 100 },
        liveOffset: { y: 25 }
      })

      expect(result.current.motionStyle.transform).toBe(
        'translate3d(100px, 25px, 0)'
      )
    })
  })

  describe('transition', () => {
    it('disables transition while dragging', () => {
      const { result } = renderMotion({
        dragging: true
      })

      expect(result.current.motionStyle.transition).toBe('none')
    })

    it('uses the settling transition when not dragging', () => {
      const { result } = renderMotion({
        dragging: false
      })

      expect(result.current.motionStyle.transition).toBe(
        'transform 180ms ease-out'
      )
    })
  })

  describe('z-index', () => {
    it('uses the dragging z-index while dragging', () => {
      const { result } = renderMotion({
        dragging: true
      })

      expect(result.current.motionStyle.zIndex).toBe(
        Z.dragging
      )
    })

    it('uses the content z-index when not dragging', () => {
      const { result } = renderMotion({
        dragging: false
      })

      expect(result.current.motionStyle.zIndex).toBe(
        Z.content
      )
    })
  })
})