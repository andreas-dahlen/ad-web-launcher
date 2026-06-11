import { dragSolver } from '@interaction/solvers/dragSolver/drag.solver'
import type { DragDesc, SwipeableDescriptor } from '@interaction/types/descriptor.types'
import { createDragData } from '@test/builders/data.factory'
import { createInterpreterSwipe, createInterpreterSwipeCommit, createInterpreterSwipeStart } from '@test/builders/input.factory'
import { base_DEFAULT, event_DEFAULT } from '@test/defaults/desc.defaults'
import { describe, expect, it } from 'vitest'

function assertDragDesc(
  desc: SwipeableDescriptor
): asserts desc is DragDesc {
  expect(desc.type).toBe('drag')
}

describe('DragSolver', () => {

  describe('swipeStart', () => {
    it('returns frameRect', () => {
      const { runtime, desc } = createInterpreterSwipeStart("drag")
      assertDragDesc(desc)
      const result = dragSolver.swipeStart(runtime, desc)
      expect(result.solv.frameRect).toEqual(base_DEFAULT.layout.frameRect)
    })
  })

  describe('swipe', () => {
    it('returns same delta as input delta', () => {
      const { runtime, desc } = createInterpreterSwipe("drag")
      assertDragDesc(desc)
      const result = dragSolver.swipe(runtime, desc)
      expect(result.solv.delta).toEqual(event_DEFAULT.swipe.delta)
    })

  })
  describe('swipeCommit', () => {
    it('returns same delta as input delta with no snap', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("drag", {
        desc: {
          data: createDragData({ snap: undefined })
        }
      })
      assertDragDesc(desc)
      const result = dragSolver.swipeCommit(runtime, desc)
      expect(result.solv.delta).toEqual(event_DEFAULT.swipeCommit.delta)
    })
  })
})
