import { describe, expect, it } from 'vitest'

import {
  isValidPrefix,
  prefixPriority,
} from '@shared/tokenUtils/prefixes.ts'

describe('[TOKEN UTILS]', () => {
  describe('isValidPrefix', () => {
    it('accepts every configured prefix', () => {
      for (const prefix of prefixPriority) {
        expect(isValidPrefix(prefix)).toBe(true)
      }
    })

    it.each([
      '',
      'x',
      'O',
      'override',
      'oi',
      null,
      undefined,
      1,
      true,
      {},
      [],
    ])('rejects %s', value => {
      expect(isValidPrefix(value)).toBe(false)
    })
  })
})