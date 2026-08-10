import { dragSolver } from '@interaction/solvers/dragSolver/drag.solver'
import type { DragDesc, SwipeableDescriptor } from '@interaction/types/descriptor/descriptor.types'
import { createDragData } from '@test/app/interaction/builders/data.factory'
import { createInterpreterSwipe, createInterpreterSwipeCommit, createInterpreterSwipeStart } from '@test/app/interaction/builders/input.factory'
import { base_DEFAULT } from '@test/app/interaction/fixtures/base.fixture'
import { event_DEFAULT } from '@test/app/interaction/fixtures/runtimeEvents.fixture'
import { describe, expect, it } from 'vitest'

function assertDragDesc(
  desc: SwipeableDescriptor
): asserts desc is DragDesc {
  expect(desc.type).toBe('drag')
}

describe('[DRAGSOLVER]', () => {

  describe('[SwipeStart]', () => {
    it('returns frameRect', () => {
      const { runtime, desc } = createInterpreterSwipeStart("drag")
      assertDragDesc(desc)
      const result = dragSolver.swipeStart(runtime, desc)
      expect(result.payload.frameRect).toEqual(base_DEFAULT.layout.frameRect)
    })
  })

  describe('[Swipe]', () => {
    it('returns same delta as input delta', () => {
      const { runtime, desc } = createInterpreterSwipe("drag")
      assertDragDesc(desc)
      const result = dragSolver.swipe(runtime, desc)
      expect(result.payload.delta).toEqual(event_DEFAULT.swipe.delta)
    })

  })
  describe('[SwipeCommit]', () => {
    it('returns same delta as input delta with no snap', () => {
      const { runtime, desc } = createInterpreterSwipeCommit("drag", {
        desc: {
          data: createDragData({ snap: undefined })
        }
      })
      assertDragDesc(desc)
      const result = dragSolver.swipeCommit(runtime, desc)
      expect(result.payload.delta).toEqual(event_DEFAULT.swipeCommit.delta)
    })
  })
})
