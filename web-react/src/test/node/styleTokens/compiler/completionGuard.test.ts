import { describe, expect, it } from 'vitest'
import { createCompletionGuard } from '@styleTokens/compiler/tracking/completionGuard'

describe('[COMPILER]', () => {
  describe('createCompletionGuard', () => {
    it('allows the first completion', () => {
      const guard = createCompletionGuard()

      expect(guard.canComplete()).toBe(true)
    })

    it('rejects subsequent completions', () => {
      const guard = createCompletionGuard()

      expect(guard.canComplete()).toBe(true)
      expect(guard.canComplete()).toBe(false)
      expect(guard.canComplete()).toBe(false)
    })

    it('allows completion again after reset', () => {
      const guard = createCompletionGuard()

      guard.canComplete()
      guard.reset()

      expect(guard.canComplete()).toBe(true)
    })
  })
})