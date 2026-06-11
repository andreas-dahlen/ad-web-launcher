import { scrollSolver } from '@interaction/solvers/scrollSolver/scroll.solver'
import type { ScrollDesc, SwipeableDescriptor } from '@interaction/types/descriptor.types'
import { createComputedScroll } from '@test/builders/computed.factory'
import { createScrollData } from '@test/builders/data.factory'
import { createScrollDesc } from '@test/builders/desc.factory'
import { createInterpreterSwipe, createInterpreterSwipeCommit, createInterpreterSwipeStart } from '@test/builders/input.factory'
import { createRuntimeSwipeCommit } from '@test/builders/runtime.factory'
import { base_DEFAULT } from '@test/defaults/desc.defaults'
import { it, describe, expect } from 'vitest'


function assertScrollDesc(
  desc: SwipeableDescriptor
): asserts desc is ScrollDesc {
  expect(desc.type).toBe('scroll')
}

describe('ScrollSolver', () => {

  describe('swipeStart overflow', () => {
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

      expect(result.routing).toBe('store')
      expect(result.solv.isOverflow).toBe(true)
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

      expect(result.routing).toBe('store')
      expect(result.solv.isOverflow).toBe(true)
    })
  })


  /* ----------------
    normal path
  -------------- */
  describe('swipeStart normal', () => {
    it('uses scroll resolver when axis is wrong', () => {
      const { runtime, desc } = createInterpreterSwipeStart("scroll", {
        runtime: {
          delta: { x: 0, y: 100 },
          thresholdValue: { x: 0, y: 20 }
        }
      })
      assertScrollDesc(desc)
      const result = scrollSolver.swipeStart(runtime, desc)

      expect(result.routing).toBe('store')
      expect(result.solv.isOverflow).toBe(false)
    })

    it('uses scroll resolver when onEdgeDir is false/undefined', () => {
      const { runtime, desc } = createInterpreterSwipeStart("scroll", {
        runtime: {
          delta: { x: 0, y: 100 },
          thresholdValue: { x: 0, y: 20 }
        },
        desc: createScrollDesc({
          data: createScrollData({
            onEdgeDir: undefined
          })
        })
      })
      assertScrollDesc(desc)
      const result = scrollSolver.swipeStart(runtime, desc)

      expect(result.routing).toBe('store')
      expect(result.solv.isOverflow).toBe(false)
    })
  })

  /* ----------------
          swipe
  -------------------- */
  describe('swipe overflow', () => {
    it('user overflow resolver when isOverflow is true', () => {
      const { runtime, desc } = createInterpreterSwipe("scroll")
      const computed = createComputedScroll({ isOverflow: true })

      assertScrollDesc(desc)
      const result = scrollSolver.swipe(runtime, desc, computed)

      expect(result.routing).toBe('store')
      expect(result.solv.isOverflow).toBe(true)

      if (result.solv.isOverflow === false) {
        throw new Error("wont ever throw xD")
      }
      expect(result.solv.overflowValue).toBeDefined()
    })
  })

  describe('swipe normal', () => {
    it('user normal resolver when isOverflow is false', () => {
      const { runtime, desc } = createInterpreterSwipe("scroll")
      const computed = createComputedScroll({ isOverflow: false })

      assertScrollDesc(desc)
      const result = scrollSolver.swipe(runtime, desc, computed)

      expect(result.routing).toBe('store')
      expect(result.solv.isOverflow).toBe(false)

      if (result.solv.isOverflow === true) {
        throw new Error("wont ever throw xD")
      }
      expect(result.solv.delta1D).toBeDefined()
    })
  })


  /* --------------------
          swipeCommit
  --------------------- */

  describe('swipeCommit overflow', () => {
    it('uses overflow resolver when isOverflow is true', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("scroll")
      const computed = createComputedScroll({ isOverflow: true })

      assertScrollDesc(desc)
      const result = scrollSolver.swipeCommit(runtime, desc, computed)

      expect(result.routing).toBe('store')
      if (result.routing !== "store") {
        throw new Error("wrong path")
      }
      expect(result.solv.isOverflow).toBe(true)
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

      expect(result.routing).toBe('store')
      if (result.routing !== "store") {
        throw new Error("wrong path")
      }
      expect(result.solv.isOverflow).toBe(true)
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

      expect(result.routing).toBe('replace-event')
    })
    it('throws an error if isOverflow and onEdgeDir is undefined', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("scroll", {
        runtime: createRuntimeSwipeCommit({ delta: { x: 0, y: 0 } }),
        desc: createScrollDesc({
          base: {
            ...base_DEFAULT.base,
            layout: base_DEFAULT.layout,
            axis: "vertical"
          },
          data: createScrollData({ onEdgeDir: undefined })
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
  describe('swipeCommit normal', () => {
    it('uses normal resolver when isOverflow is false', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("scroll")
      const computed = createComputedScroll({ isOverflow: false })

      assertScrollDesc(desc)
      const result = scrollSolver.swipeCommit(runtime, desc, computed)

      expect(result.routing).toBe('store')
      if (result.routing !== "store") {
        throw new Error("wrong path")
      }
      expect(result.solv.isOverflow).toBe(false)
    })
  })

})
