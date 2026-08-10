import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCarouselMotion } from '@primitives/Carousel/hooks/useCarouselMotion.hook'
import { carouselStore } from '@primitives/Carousel/store/carousel.store'

vi.mock('@primitives/Carousel/store/carousel.store', () => ({
  carouselStore: {
    getState: vi.fn()
  }
}))

function createTransitionEvent(
  overrides: Partial<{
    target: EventTarget | null
    currentTarget: EventTarget | null
    propertyName: string
  }> = {}
) {
  const element = document.createElement('div')

  return {
    target: element,
    currentTarget: element,
    propertyName: 'transform',
    ...overrides
  } as unknown as React.TransitionEvent
}

describe('[USE CAROUSEL MOTION]', () => {
  let setSettling: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    setSettling = vi.fn()

    vi.mocked(carouselStore.getState).mockReturnValue({
      setSettling
    } as never)
  })

  function renderMotion(
    overrides: Partial<Parameters<typeof useCarouselMotion>[0]> = {}
  ) {
    return renderHook(() =>
      useCarouselMotion({
        store: {
          liveOffset: 0,
          dragging: false,
          settling: false
        },
        axisSize: 100,
        horizontal: true,
        id: 'test-carousel',
        ...overrides
      })
    )
  }

  function getStyle(
    result: ReturnType<typeof renderMotion>['result'],
    role: 'prev' | 'current' | 'next'
  ) {
    return result.current.styleForRole(role)
  }

  describe('transition', () => {
    it('uses the configured transform transition when idle', () => {
      const { result } = renderMotion()

      expect(getStyle(result, 'current').transition).toEqual(
        expect.stringContaining('transform')
      )
    })

    it('disables transition while dragging', () => {
      const { result } = renderMotion({
        store: {
          liveOffset: 0,
          dragging: true,
          settling: false
        }
      })

      expect(getStyle(result, 'current').transition).toBe('none')
    })

    it('disables transition while settling', () => {
      const { result } = renderMotion({
        store: {
          liveOffset: 0,
          dragging: false,
          settling: true
        }
      })

      expect(getStyle(result, 'current').transition).toBe('none')
    })
  })

  describe('horizontal motion', () => {
    it('positions the current role at the live offset', () => {
      const { result } = renderMotion({
        store: {
          liveOffset: 25,
          dragging: true,
          settling: false
        },
        axisSize: 100,
        horizontal: true
      })

      expect(getStyle(result, 'current').transform).toBe(
        'translate3d(25px,0,0)'
      )
    })

    it('positions the next role after the current axis size', () => {
      const { result } = renderMotion({
        axisSize: 100,
        horizontal: true
      })

      expect(getStyle(result, 'next').transform).toBe(
        'translate3d(100px,0,0)'
      )
    })

    it('positions the previous role before the current axis size', () => {
      const { result } = renderMotion({
        axisSize: 100,
        horizontal: true
      })

      expect(getStyle(result, 'prev').transform).toBe(
        'translate3d(-100px,0,0)'
      )
    })

    it('adds the live offset to every role position', () => {
      const { result } = renderMotion({
        store: {
          liveOffset: 20,
          dragging: true,
          settling: false
        },
        axisSize: 100,
        horizontal: true
      })

      expect(getStyle(result, 'prev').transform).toBe(
        'translate3d(-80px,0,0)'
      )

      expect(getStyle(result, 'current').transform).toBe(
        'translate3d(20px,0,0)'
      )

      expect(getStyle(result, 'next').transform).toBe(
        'translate3d(120px,0,0)'
      )
    })
  })

  describe('vertical motion', () => {
    it('positions the current role at the live offset', () => {
      const { result } = renderMotion({
        store: {
          liveOffset: 25,
          dragging: true,
          settling: false
        },
        axisSize: 200,
        horizontal: false
      })

      expect(getStyle(result, 'current').transform).toBe(
        'translate3d(0,25px,0)'
      )
    })

    it('positions the next role along the vertical axis', () => {
      const { result } = renderMotion({
        axisSize: 200,
        horizontal: false
      })

      expect(getStyle(result, 'next').transform).toBe(
        'translate3d(0,200px,0)'
      )
    })

    it('positions the previous role along the vertical axis', () => {
      const { result } = renderMotion({
        axisSize: 200,
        horizontal: false
      })

      expect(getStyle(result, 'prev').transform).toBe(
        'translate3d(0,-200px,0)'
      )
    })
  })

  describe('transition end', () => {
    it('sets settling when the transform transition ends', () => {
      const { result } = renderMotion()

      result.current.onTransitionEnd(
        createTransitionEvent()
      )

      expect(setSettling).toHaveBeenCalledWith(
        'test-carousel'
      )
    })

    it('ignores transitions from child elements', () => {
      const { result } = renderMotion()

      const parent = document.createElement('div')
      const child = document.createElement('div')

      result.current.onTransitionEnd(
        createTransitionEvent({
          target: child,
          currentTarget: parent
        })
      )

      expect(setSettling).not.toHaveBeenCalled()
    })

    it('ignores transitions for properties other than transform', () => {
      const { result } = renderMotion()

      result.current.onTransitionEnd(
        createTransitionEvent({
          propertyName: 'opacity'
        })
      )

      expect(setSettling).not.toHaveBeenCalled()
    })
  })
})