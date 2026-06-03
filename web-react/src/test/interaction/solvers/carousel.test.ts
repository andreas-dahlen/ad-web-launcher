import { carouselSolver } from '@interaction/solvers/carouselSolver/carouselSolver'
import { createBaseWithAxis1D } from '@test/fixtures/base'
import { createCarouselData } from '@test/fixtures/data'
import { createCarouselInput } from '@test/fixtures/input'
import { describe, expect, it } from 'vitest'


describe('CarosuelSolver', () => {

  describe('functions', () => {
    it('confirms that all functions exist', () => {
      expect(carouselSolver.swipeStart).toBeDefined()
      expect(carouselSolver.swipe).toBeDefined()
      expect(carouselSolver.swipeCommit).toBeDefined()
    })
    it('confirms that press functions does NOT exist', () => {
      expect(carouselSolver.press).not.toBeDefined()
      expect(carouselSolver.pressCancel).not.toBeDefined()
      expect(carouselSolver.pressRelease).not.toBeDefined()
      expect(carouselSolver.swipeRevert).not.toBeDefined()
    })
  })

  describe('swipeStart', () => {
    it('always returns storeAccepted: true', () => {
      const { runtime, desc, computed } = createCarouselInput()
      const result = carouselSolver.swipeStart?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(true)
    })
  })
  describe('swipe', () => {

    it('returns storeAccepted: false when swipe is gated', () => {

      const { runtime, desc, computed } = createCarouselInput({
        runtime: {
          delta: { x: 1000, y: 0 }
        },
        desc: {
          base: createBaseWithAxis1D({
            axis: 'vertical'
          }),
          data: createCarouselData({
            lockSwipeAt: undefined,
            sceneSize: { width: 0, height: 0 }
          })
        }
      })

      const result = carouselSolver.swipe?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(false)
    })
    it('returns storeAccepted: false when vertical-next is locked', () => {

      const { runtime, desc, computed } = createCarouselInput({
        runtime: {
          delta: { x: 0, y: -1000 }
        },
        desc: {
          base: createBaseWithAxis1D({
            axis: 'vertical'
          }),
          data: createCarouselData({
            index: 3,
            lockSwipeAt: { prev: 1, next: 3 },
          })
        }
      })

      const result = carouselSolver.swipe?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(false)
    })
    it('returns storeAccepted: false when horizontal-previous is locked', () => {

      const { runtime, desc, computed } = createCarouselInput({
        runtime: {
          delta: { x: 1000, y: 0 }
        },
        desc: {
          base: createBaseWithAxis1D({
            axis: 'horizontal'
          }),
          data: createCarouselData({
            index: 1,
            lockSwipeAt: { prev: 1, next: 3 },
          })
        }
      })

      const result = carouselSolver.swipe?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(false)
    })

    it('returns delta1D when swipe is valid', () => {
      const { runtime, desc, computed } = createCarouselInput({
        desc: {
          data: createCarouselData({
            lockSwipeAt: undefined
          })
        }
      })
      const result = carouselSolver.swipe?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(true)
      if (result?.storeAccepted) {
        expect(result.delta1D).toBeDefined()
      }
    })
  })

  describe('swipeCommit', () => {

    it('returns revert when swipe is gated', () => {
      const { runtime, desc, computed } = createCarouselInput({
        runtime: {
          delta: { x: 10, y: 10 }
        },
        desc: {
          data: createCarouselData({
            lockSwipeAt: undefined,
            sceneSize: { width: 0, height: 0 }
          })
        }
      })
      const result = carouselSolver.swipeCommit?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(true)
      if (result?.storeAccepted) {
        expect(result?.event).toBe('swipeRevert')
      }
    })
  })

  it('returns revert when vertical-previous swipeCommit is locked', () => {
    const { runtime, desc, computed } = createCarouselInput({
      runtime: {
        delta: { x: 0, y: 1000 }
      },
      desc: {
        base: createBaseWithAxis1D({
          axis: 'vertical'
        }),
        data: createCarouselData({
          index: 1,
          lockSwipeAt: { prev: 1, next: 3 },
        })
      }
    })
    const result = carouselSolver.swipeCommit?.(runtime, desc, computed)
    expect(result?.storeAccepted).toBe(true)
    if (result?.storeAccepted) {
      expect(result?.event).toBe('swipeRevert')
    }
  })
  it('returns revert when horizontal-next swipeCommit is locked', () => {
    const { runtime, desc, computed } = createCarouselInput({
      runtime: {
        delta: { x: -1000, y: 0 }
      },
      desc: {
        base: createBaseWithAxis1D({
          axis: 'horizontal'
        }),
        data: createCarouselData({
          index: 3,
          lockSwipeAt: { prev: 1, next: 3 },
        })
      }
    })
    const result = carouselSolver.swipeCommit?.(runtime, desc, computed)
    expect(result?.storeAccepted).toBe(true)
    if (result?.storeAccepted) {
      expect(result?.event).toBe('swipeRevert')
    }
  })

  it('returns delta1D and dir when swipeCommit is valid', () => {
    const { runtime, desc, computed } = createCarouselInput({
      runtime: {
        delta: { x: 200, y: 0 }
      },
      desc: {
        base: createBaseWithAxis1D({
          axis: 'horizontal'
        }),
        data: createCarouselData({
          index: 3,
          lockSwipeAt: { prev: 1, next: 3 },
        })
      }
    })
    const result = carouselSolver.swipeCommit?.(runtime, desc, computed)
    expect(result?.storeAccepted).toBe(true)
    if (result?.storeAccepted) {
      expect(result.delta1D).toBeDefined()
      expect(result.direction).toBeDefined()
    }
  })
})
