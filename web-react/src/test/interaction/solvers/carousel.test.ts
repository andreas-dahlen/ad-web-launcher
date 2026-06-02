import { carouselSolver } from '@interaction/solvers/carouselSolver/carouselSolver'
import { createBaseSwipe } from '@test/fixtures/base'
import { createCtxCarousel } from '@test/fixtures/ctx'
import { createCarouselData } from '@test/fixtures/data'
import { createCarouselDesc } from '@test/fixtures/desc'
import { describe, expect, it } from 'vitest'


describe('CarosuelSolver', () => {

  describe('swipeStart', () => {
    it('always returns storeAccepted: true', () => {
      const desc = createCarouselDesc()
      const result = carouselSolver.swipeStart?.(desc)
      expect(result?.storeAccepted).toBe(true)
    })
  })
  describe('swipe', () => {

    it('returns storeAccepted: false when swipe is gated', () => {
      const desc = createCarouselDesc({
        data: createCarouselData({
          lockSwipeAt: undefined,
          sceneSize: { width: 0, height: 0 }
        }),
        ctx: createCtxCarousel({
          delta: { x: 500, y: 500 }
        })
      })
      const result = carouselSolver.swipe?.(desc)
      expect(result?.storeAccepted).toBe(false)
    })
    it('returns storeAccepted: false when swipe is locked', () => {
      const desc = createCarouselDesc({
        base: { ...createBaseSwipe(), axis: "vertical" },
        data: createCarouselData({
          index: 3,
          lockSwipeAt: { prev: 1, next: 3 },
        }),
        ctx: createCtxCarousel({
          delta: { x: 0, y: -5000 }
        })
      })
      const result = carouselSolver.swipe?.(desc)
      expect(result?.storeAccepted).toBe(false)

      const desc2 = createCarouselDesc({
        base: { ...createBaseSwipe(), axis: "vertical" },
        data: createCarouselData({
          index: 0,
          lockSwipeAt: { prev: 0, next: 3 },
        }),
        ctx: createCtxCarousel({
          delta: { x: 0, y: 5000 }
        })
      })
      const result2 = carouselSolver.swipe?.(desc2)
      expect(result2?.storeAccepted).toBe(false)
    })

    it('returns delta1D when swipe is valid', () => {
      const desc = createCarouselDesc({
        base: { ...createBaseSwipe(), axis: "vertical" },
        data: createCarouselData({
          lockSwipeAt: undefined
        })
      })
      const result = carouselSolver.swipe?.(desc)
      expect(result?.storeAccepted).toBe(true)
      expect(result?.delta1D).toBeDefined()
    })
  })

  describe('swipeCommit', () => {

    it('returns revert when swipe is gated', () => {
      const desc = createCarouselDesc({
        data: createCarouselData({
          lockSwipeAt: undefined,
          sceneSize: { width: 0, height: 0 }
        }),
        ctx: createCtxCarousel({
          delta: { x: 500, y: 500 }
        })
      })
      const result = carouselSolver.swipeCommit?.(desc)
      expect(result?.storeAccepted).toBe(true)
      expect(result?.event).toBe('swipeRevert')
    })
  })

  it('returns revert when swipe is locked', () => {
    const desc = createCarouselDesc({
      base: { ...createBaseSwipe(), axis: "vertical" },
      data: createCarouselData({
        index: 3,
        lockSwipeAt: { prev: 1, next: 3 },
      }),
      ctx: createCtxCarousel({
        delta: { x: 0, y: -5000 }
      })
    })
    const result = carouselSolver.swipeCommit?.(desc)
    expect(result?.storeAccepted).toBe(true)
    expect(result?.event).toBe('swipeRevert')

    const desc2 = createCarouselDesc({
      base: { ...createBaseSwipe(), axis: "vertical" },
      data: createCarouselData({
        index: 0,
        lockSwipeAt: { prev: 0, next: 3 },
      }),
      ctx: createCtxCarousel({
        delta: { x: 0, y: 5000 }
      })
    })
    const result2 = carouselSolver.swipeCommit?.(desc2)
    expect(result2?.storeAccepted).toBe(true)
    expect(result2?.event).toBe('swipeRevert')
  })

  it('returns delta1D and dir when swipeCommit is valid', () => {
    const desc = createCarouselDesc({
      base: { ...createBaseSwipe(), axis: "vertical" },
      data: createCarouselData({
        lockSwipeAt: undefined
      })
    })
    const result = carouselSolver.swipeCommit?.(desc)
    expect(result?.storeAccepted).toBe(true)
    expect(result?.delta1D).toBeDefined()
    expect(result?.direction).toBeDefined()
  })
})
