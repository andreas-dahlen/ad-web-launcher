import { scrollSolver } from '@interaction/solvers/scrollSolver/scroll.solver.ts'
import type { ScrollDesc, SwipeableDescriptor } from '@interaction/types/descriptor/descriptor.types.ts'
import { createComputedScroll } from '@test/app/interaction/builders/computed.factory.ts'
import { createScrollData } from '@test/app/interaction/builders/data.factory.ts'
import { createScrollDesc } from '@test/app/interaction/builders/desc.factory.ts'
import { createInterpreterSwipe, createInterpreterSwipeCommit, createInterpreterSwipeStart } from '@test/app/interaction/builders/input.factory.ts'
import { createRuntimeSwipeCommit } from '@test/app/interaction/builders/runtime.factory.ts'
import { base_DEFAULT } from '@test/app/interaction/fixtures/base.fixture.ts'
import { it, describe, expect } from 'vitest'


function assertScrollDesc(
  desc: SwipeableDescriptor
): asserts desc is ScrollDesc {
  expect(desc.type).toBe('scroll')
}

describe('[SCROLLSOLVER]', () => {

  describe('[SwipeStart Overflow]', () => {
    it('uses overflow resolver when scroll is overflowing', () => {
      const { runtime, desc } = createInterpreterSwipeStart("scroll", {
        runtime: {
          delta: { x: 0, y: 100 },
          thresholdValue: { x: 0, y: 20 }
        },
        desc: createScrollDesc({
          base: {
            ...base_DEFAULT.base,
            layout: base_DEFAULT.layout,
            axis: "vertical"
          }
        })
      })
      assertScrollDesc(desc)
      const result = scrollSolver.swipeStart(runtime, desc)

      expect(result.route).toBe('default')
      expect(result.payload.isOverflow).toBe(true)
    })
    it('uses overflow resolver when isVisible is false', () => {
      const { runtime, desc } = createInterpreterSwipeStart("scroll", {
        runtime: {
          delta: { x: 0, y: 100 },
          thresholdValue: { x: 0, y: 20 },
        },
        desc: createScrollDesc({
          base: {
            ...base_DEFAULT.base,
            layout: base_DEFAULT.layout,
            axis: "horizontal" //even with wrong axis.
          },
          data: createScrollData({ isVisible: false })
        })
      })
      assertScrollDesc(desc)
      const result = scrollSolver.swipeStart(runtime, desc)

      expect(result.route).toBe('default')
      expect(result.payload.isOverflow).toBe(true)
    })
  })


  /* ----------------
    normal path
  -------------- */
  describe('[SwipeStart Normal]', () => {
    it('uses scroll resolver when axis is wrong', () => {
      const { runtime, desc } = createInterpreterSwipeStart("scroll", {
        runtime: {
          delta: { x: 0, y: 100 },
          thresholdValue: { x: 0, y: 20 }
        }
      })
      assertScrollDesc(desc)
      const result = scrollSolver.swipeStart(runtime, desc)

      expect(result.route).toBe('default')
      expect(result.payload.isOverflow).toBe(false)
    })

    it('uses scroll resolver when overflowSide is false/undefined', () => {
      const { runtime, desc } = createInterpreterSwipeStart("scroll", {
        runtime: {
          delta: { x: 0, y: 100 },
          thresholdValue: { x: 0, y: 20 }
        },
        desc: createScrollDesc({
          data: createScrollData({
            overflowSide: undefined
          })
        })
      })
      assertScrollDesc(desc)
      const result = scrollSolver.swipeStart(runtime, desc)

      expect(result.route).toBe('default')
      expect(result.payload.isOverflow).toBe(false)
    })
  })

  /* ----------------
          swipe
  -------------------- */
  describe('[Swipe Overflow]', () => {
    it('user overflow resolver when isOverflow is true', () => {
      const { runtime, desc } = createInterpreterSwipe("scroll")
      const computed = createComputedScroll({ isOverflow: true })

      assertScrollDesc(desc)
      const result = scrollSolver.swipe(runtime, desc, computed)

      expect(result.route).toBe('default')
      expect(result.payload.isOverflow).toBe(true)

      if (result.payload.isOverflow === false) {
        throw new Error("wont ever throw xD")
      }
      expect(result.payload.overflowValue).toBeDefined()
    })
  })

  describe('[Swipe Normal]', () => {
    it('user normal resolver when isOverflow is false', () => {
      const { runtime, desc } = createInterpreterSwipe("scroll")
      const computed = createComputedScroll({ isOverflow: false })

      assertScrollDesc(desc)
      const result = scrollSolver.swipe(runtime, desc, computed)

      expect(result.route).toBe('default')
      expect(result.payload.isOverflow).toBe(false)

      if (result.payload.isOverflow === true) {
        throw new Error("wont ever throw xD")
      }
      expect(result.payload.delta1D).toBeDefined()
    })
  })


  /* --------------------
          swipeCommit
  --------------------- */

  describe('[SwipeCommit Overflow]', () => {
    it('uses overflow resolver when isOverflow is true', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("scroll")
      const computed = createComputedScroll({ isOverflow: true })

      assertScrollDesc(desc)
      const result = scrollSolver.swipeCommit(runtime, desc, computed)

      expect(result.route).toBe('default')
      if (result.route !== "default") {
        throw new Error("wrong path")
      }
      expect(result.payload.isOverflow).toBe(true)
    })
    it('overflow commits when delta is big enough', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("scroll", {
        runtime: createRuntimeSwipeCommit({ delta: { x: 0, y: 200 } }),
        desc: createScrollDesc({
          base: {
            ...base_DEFAULT.base,
            layout: base_DEFAULT.layout,
            axis: "vertical"
          }
        })
      })
      const computed = createComputedScroll({ isOverflow: true })

      assertScrollDesc(desc)
      const result = scrollSolver.swipeCommit(runtime, desc, computed)

      expect(result.route).toBe('default')
      if (result.route !== "default") {
        throw new Error("wrong path")
      }
      expect(result.payload.isOverflow).toBe(true)
    })
    it('overflow reverts when delta is 0', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("scroll", {
        runtime: createRuntimeSwipeCommit({ delta: { x: 0, y: 0 } }),
        desc: createScrollDesc({
          base: {
            ...base_DEFAULT.base,
            layout: base_DEFAULT.layout,
            axis: "vertical"
          }
        })
      })
      const computed = createComputedScroll({ isOverflow: true })

      assertScrollDesc(desc)
      const result = scrollSolver.swipeCommit(runtime, desc, computed)

      expect(result.route).toBe('revert')
    })
    it('throws an error if isOverflow and overflowSide is undefined', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("scroll", {
        runtime: createRuntimeSwipeCommit({ delta: { x: 0, y: 0 } }),
        desc: createScrollDesc({
          base: {
            ...base_DEFAULT.base,
            layout: base_DEFAULT.layout,
            axis: "vertical"
          },
          data: createScrollData({ overflowSide: undefined })
        })
      })
      const computed = createComputedScroll({ isOverflow: true })

      assertScrollDesc(desc)
      expect(() => {
        scrollSolver.swipeCommit(runtime, desc, computed)
      }).toThrow()
    })

    /* ----------------
      normal path
    -------------- */

  })
  describe('[SwipeCommit Normal]', () => {
    it('uses normal resolver when isOverflow is false', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("scroll")
      const computed = createComputedScroll({ isOverflow: false })

      assertScrollDesc(desc)
      const result = scrollSolver.swipeCommit(runtime, desc, computed)

      expect(result.route).toBe('default')
      if (result.route !== "default") {
        throw new Error("wrong path")
      }
      expect(result.payload.isOverflow).toBe(false)
    })
  })

})
