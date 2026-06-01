import { gestureUtils } from '@interaction/core/gestureUtils'
import { describe, expect, it } from 'vitest'

describe('gestureUtils', () => {

  describe('resolveAxis', () => {
    it('returns both when both', () => {

      const result = gestureUtils.resolveAxis('horizontal', dragDesc)

      expect(result).toBe('both')
    })
  })
})