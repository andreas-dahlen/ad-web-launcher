import { describe, expect, it } from 'vitest'

import { whatChanged } from '../../../src/entries/watch/watchers/resolveChange.ts'

describe('[ENTRIES > WATCH > WATCHERS]', () => {
  describe('whatChanged', () => {
    it('returns CSS for a CSS file', () => {
      expect(
        whatChanged('/project/src/styles.css', '/project/tokens'),
      ).toBe('CSS')
    })

    it('returns TOKEN for a JSON token file', () => {
      expect(
        whatChanged('/project/tokens/colors.json', '/project/tokens'),
      ).toBe('TOKEN')
    })

    it('returns TOKEN for a JSONC token file', () => {
      expect(
        whatChanged('/project/tokens/colors.jsonc', '/project/tokens'),
      ).toBe('TOKEN')
    })

    it('returns null for unsupported files', () => {
      expect(
        whatChanged('/project/src/main.ts', '/project/tokens'),
      ).toBeNull()
    })

    it('returns null for JSON files outside the token path', () => {
      expect(
        whatChanged('/project/config.json', '/project/tokens'),
      ).toBeNull()
    })

    it('returns null for JSON files in a sibling path', () => {
      expect(
        whatChanged(
          '/project/token-backup/colors.json',
          '/project/tokens',
        ),
      ).toBeNull()
    })
  })
})