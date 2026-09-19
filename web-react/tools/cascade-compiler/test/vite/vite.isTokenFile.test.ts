import { describe, expect, it } from 'vitest'

import { isTokenFile } from '../../src/vite/helpers/isTokenFile.ts'

describe('[VITE]', () => {
  describe('isTokenFile', () => {
    it('accepts JSON token files inside the token directory', () => {
      expect(
        isTokenFile(
          '/project/tokens',
          '/project/tokens/colors.json',
        ),
      ).toBe(true)
    })

    it('accepts JSONC token files inside the token directory', () => {
      expect(
        isTokenFile(
          '/project/tokens',
          '/project/tokens/colors.jsonc',
        ),
      ).toBe(true)
    })

    it('rejects files with unsupported extensions', () => {
      expect(
        isTokenFile(
          '/project/tokens',
          '/project/tokens/colors.css',
        ),
      ).toBe(false)
    })

    it('rejects files outside the token directory', () => {
      expect(
        isTokenFile(
          '/project/tokens',
          '/project/other/colors.json',
        ),
      ).toBe(false)
    })
  })
})