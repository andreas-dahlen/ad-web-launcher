import { carouselSolver } from '@interaction/solvers/carouselSolver/carousel.solver.ts'
import type { CarouselDesc, SwipeableDescriptor } from '@interaction/types/descriptor/descriptor.types.ts'
import { createBaseWithAxis1D } from '@test/app/interaction/builders/base.factory.ts'
import { createCarouselData } from '@test/app/interaction/builders/data.factory.ts'
import { createInterpreterSwipe, createInterpreterSwipeCommit } from '@test/app/interaction/builders/input.factory.ts'
import { createRuntimeSwipe } from '@test/app/interaction/builders/runtime.factory.ts'
import { describe, expect, it } from 'vitest'

function assertCarouselDesc(
  desc: SwipeableDescriptor
): asserts desc is CarouselDesc {
  expect(desc.type).toBe('carousel')
}


describe('[CAROUSELSOLVER]', () => {

  describe('[Swipe]', () => {

    it('returns null when swipe is gated', () => {
      const { runtime, desc } = createInterpreterSwipe("carousel", {
        runtime: {
          delta: { x: 0, y: 1000 }
        }
      })
      assertCarouselDesc(desc)
      const result = carouselSolver.swipe(runtime, desc)
      expect(result).toBe(null)

    })

    it('returns null when vertical-next is locked', () => {
      const { runtime, desc } = createInterpreterSwipe("carousel", {
        runtime: {
          delta: { x: 0, y: -1000 }
        },
        desc: {
          base: createBaseWithAxis1D({ axis: 'vertical' }),
          data: createCarouselData({
            currentScene: 3,
            lockSwipeAt: { prev: 1, next: 3 },
          })
        }
      })
      assertCarouselDesc(desc)
      const result = carouselSolver.swipe(runtime, desc)
      expect(result).toBe(null)
    })

    it('returns null when horizontal-previous is locked', () => {
      const { runtime, desc } = createInterpreterSwipe("carousel", {
        runtime: {
          delta: { x: 1000, y: 0 }
        },
        desc: {
          data: createCarouselData({
            currentScene: 1,
            lockSwipeAt: { prev: 1, next: 3 },
          })
        }
      })
      assertCarouselDesc(desc)
      const result = carouselSolver.swipe(runtime, desc)
      expect(result).toBe(null)
    })

    it('returns delta1D when swipe is valid', () => {
      const { runtime, desc } = createInterpreterSwipe("carousel", {
        runtime: {
          delta: { x: 100, y: 10 }
        },
        desc: {
          data: createCarouselData({
            lockSwipeAt: undefined
          })
        }
      })
      assertCarouselDesc(desc)
      const result = carouselSolver.swipe(runtime, desc)
      expect(result).toBeDefined()
      expect(result?.payload.delta1D).toBeDefined()
    })
  })

  it('returns correct values for delta1D', () => {
    const { runtime, desc } = createInterpreterSwipe("carousel", {
      runtime: {
        delta: { x: 100, y: 10 }
      },
      desc: {
        data: createCarouselData({
          lockSwipeAt: undefined
        })
      }
    })

    const runtime2 = createRuntimeSwipe({
      event: "swipe",
      delta: { x: -100, y: 10 }
    })
    assertCarouselDesc(desc)
    const result = carouselSolver.swipe(runtime, desc)
    const result2 = carouselSolver.swipe(runtime2, desc)
    expect(result?.payload.delta1D).toEqual(100)
    expect(result2?.payload.delta1D).toEqual(-100)
  })


  describe('[SwipeCommit]', () => {

    it('returns revert when swipe is gated', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("carousel", {
        runtime: {
          delta: { x: 0, y: 1000 }
        }
      })
      assertCarouselDesc(desc)
      const result = carouselSolver.swipeCommit(runtime, desc)
      expect(result?.route).toBe("revert")
    })

    it('returns revert when vertical-previous swipeCommit is locked', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("carousel", {
        runtime: {
          delta: { x: 0, y: 1000 }
        },
        desc: {
          base: createBaseWithAxis1D({ axis: "vertical" }),
          data: createCarouselData({
            currentScene: 1,
            lockSwipeAt: { prev: 1, next: 3 },
          })
        },
      })
      assertCarouselDesc(desc)
      const result = carouselSolver.swipeCommit(runtime, desc)
      expect(result?.route).toBe("revert")
    })
    it('returns revert when horizontal-next swipeCommit is locked', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("carousel", {
        runtime: {
          delta: { x: -1000, y: 0 }
        },
        desc: {
          data: createCarouselData({
            currentScene: 3,
            lockSwipeAt: { prev: 1, next: 3 },
          })
        }
      })
      assertCarouselDesc(desc)
      const result = carouselSolver.swipeCommit(runtime, desc)
      expect(result?.route).toBe("revert")
    })

    it('returns delta1D and dir when swipeCommit is valid', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("carousel", {
        runtime: {
          delta: { x: 200, y: 0 }
        },
        desc: {
          data: createCarouselData({
            currentScene: 3,
            lockSwipeAt: { prev: 1, next: 3 },
          })
        }
      })
      assertCarouselDesc(desc)
      const result = carouselSolver.swipeCommit(runtime, desc)
      expect(result?.route).toBe("default")
      if (result?.route === "default") {
        expect(result.payload.direction).toBeDefined()
        expect(result.payload.delta1D).toBeDefined()
      }
    })
  })
})