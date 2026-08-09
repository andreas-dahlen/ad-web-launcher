import { describe, expect, it } from 'vitest'

import { formatTokenPatch } from '@styleTokens/emitters/generate/format/formatTokenPatch'
import type { GroupMetadata } from '@styleTokens/emitters/extract/assemblers/assembleMetadata'

function createGroup(
  overrides: Partial<GroupMetadata> = {},
): GroupMetadata {
  return {
    name: 'button',
    groupPath: '/tokens/button',
    tokenFiles: [
      '/tokens/button/default.jsonc',
      '/tokens/button/hover.jsonc',
    ],
    cssFile: '/components/Button/Button.module.css',
    ...overrides,
  }
}

describe('[EMITTER]', () => {
  describe('formatTokenPatch', () => {
    it('returns no patches when there is no metadata', () => {
      expect(formatTokenPatch([])).toEqual([])
    })

    it('creates a JSONC patch pointing to the CSS file', () => {
      const [result] = formatTokenPatch([
        createGroup({
          tokenFiles: ['/tokens/button/default.jsonc'],
        }),
      ])

      expect(result).toEqual({
        filePath: '/tokens/button/default.jsonc',
        content:
          '// file://wsl.localhost/Ubuntu/components/Button/Button.module.css',
      })
    })

    it('creates a CSS patch containing all token files', () => {
      const results = formatTokenPatch([
        createGroup({
          tokenFiles: [
            '/tokens/button/default.jsonc',
            '/tokens/button/hover.jsonc',
          ],
        }),
      ])

      const result = results.find(
        file => file.filePath === '/components/Button/Button.module.css',
      )

      expect(result).toEqual({
        filePath: '/components/Button/Button.module.css',
        content:
          '/* \n' +
          'file://wsl.localhost/Ubuntu/tokens/button/default.jsonc\n' +
          'file://wsl.localhost/Ubuntu/tokens/button/hover.jsonc\n' +
          '*/',
      })
    })

    it('creates one JSONC patch for each JSONC token file', () => {
      const results = formatTokenPatch([
        createGroup(),
      ])

      expect(
        results.filter(file => file.filePath.endsWith('.jsonc')),
      ).toHaveLength(2)
    })

    it('ignores token files that are not JSONC', () => {
      const results = formatTokenPatch([
        createGroup({
          tokenFiles: [
            '/tokens/button/default.jsonc',
            '/tokens/button/legacy.json',
            '/tokens/button/readme.txt',
          ],
        }),
      ])

      expect(
        results.map(file => file.filePath),
      ).toEqual([
        '/tokens/button/default.jsonc',
        '/components/Button/Button.module.css',
      ])
    })

    it('does not create a CSS patch for a non-CSS file', () => {
      const results = formatTokenPatch([
        createGroup({
          cssFile: '/components/Button/Button.module',
        }),
      ])

      expect(
        results.some(
          file => file.filePath === '/components/Button/Button.module',
        ),
      ).toBe(false)

      expect(
        results.some(
          file => file.filePath === '/tokens/button/default.jsonc',
        ),
      ).toBe(true)
    })

    it('creates patches for multiple groups', () => {
      const results = formatTokenPatch([
        createGroup(),
        createGroup({
          name: 'surface',
          groupPath: '/tokens/surface',
          tokenFiles: [
            '/tokens/surface/default.jsonc',
          ],
          cssFile: '/components/Surface/Surface.module.css',
        }),
      ])

      expect(results.map(file => file.filePath)).toEqual([
        '/tokens/button/default.jsonc',
        '/tokens/button/hover.jsonc',
        '/components/Button/Button.module.css',
        '/tokens/surface/default.jsonc',
        '/components/Surface/Surface.module.css',
      ])
    })
  })
})