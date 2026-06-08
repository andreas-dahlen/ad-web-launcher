import { dragSolver } from '@interaction/solvers/dragSolver/drag.solver'
import { createDragInput } from '@test/fixtures/input.fixture'
import { describe, expect, it } from 'vitest'


describe('DragSolver', () => {

  describe('functions', () => {
    it('confirms that all functions exist', () => {
      expect(dragSolver.swipeStart).toBeDefined()
      expect(dragSolver.swipe).toBeDefined()
      expect(dragSolver.swipeCommit).toBeDefined()
    })
    it('confirms that press functions does NOT exist', () => {
      expect(dragSolver.press).not.toBeDefined()
      expect(dragSolver.pressCancel).not.toBeDefined()
      expect(dragSolver.pressRelease).not.toBeDefined()
      expect(dragSolver.swipeRevert).not.toBeDefined()
    })
  })

  describe('output validation', () => {
    it('returns storeAccepted: true for swipeStart', () => {
      const { runtime, desc, computed } = createDragInput()
      const result = dragSolver.swipeStart?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(true)
    })
    it('returns storeAccepted: true for swipe', () => {
      const { runtime, desc, computed } = createDragInput()
      const result = dragSolver.swipe?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(true)
    })
    it('returns storeAccepted: true for swipeCommit', () => {
      const { runtime, desc, computed } = createDragInput()
      const result = dragSolver.swipeCommit?.(runtime, desc, computed)
      expect(result?.storeAccepted).toBe(true)
    })

    it('returns delta swipeStart', () => {
      const { runtime, desc, computed } = createDragInput()
      const result = dragSolver.swipeStart?.(runtime, desc, computed)
      expect(result?.delta).toBeDefined()
    })
    it('returns delta swipe', () => {
      const { runtime, desc, computed } = createDragInput()
      const result = dragSolver.swipe?.(runtime, desc, computed)
      expect(result?.delta).toBeDefined()
    })
    it('returns delta swipeCommit', () => {
      const { runtime, desc, computed } = createDragInput()
      const result = dragSolver.swipeCommit?.(runtime, desc, computed)
      expect(result?.delta).toBeDefined()
    })
  })
})
