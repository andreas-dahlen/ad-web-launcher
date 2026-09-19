import { describe, expect, it } from 'vitest'

import { formatPackageFile } from '../../../src/emitters/compose/format/formatPackageFile.ts'
import type { PackageData } from '../../../src/types/emitter.types.ts'

function createPackageData(
  overrides: Partial<PackageData> = {},
): PackageData {
  return {
    tokenNames: [],
    presetNames: [],
    ...overrides,
  }
}

describe('[EMITTERS]', () => {
  describe('formatPackageFile', () => {
    it('creates JavaScript and declaration files', () => {
      const result = formatPackageFile(
        createPackageData({
          tokenNames: ['button', 'card'],
          presetNames: ['dark'],
        }),
      )

      expect(result).toHaveLength(2)

      expect(result[0]).toEqual({
        outputFile: 'index.js',
        kind: 'package',
        content: expect.stringContaining(
          'export * from "./tokenModules/button.js"',
        ),
      })

      expect(result[1]).toEqual({
        outputFile: 'index.d.ts',
        kind: 'package',
        content: expect.stringContaining(
          'export * from "./tokenModules/button"',
        ),
      })
    })

    it('creates exports for all tokens and presets', () => {
      const result = formatPackageFile(
        createPackageData({
          tokenNames: ['button', 'card'],
          presetNames: ['dark', 'light'],
        }),
      )

      expect(result[0].content).toContain(
        'export * from "./tokenModules/button.js"',
      )
      expect(result[0].content).toContain(
        'export * from "./tokenModules/card.js"',
      )

      expect(result[1].content).toContain(
        'export * from "./tokenModules/button"',
      )
      expect(result[1].content).toContain(
        'export * from "./tokenModules/card"',
      )
      expect(result[1].content).toContain(
        'export * from "./presets/dark"',
      )
      expect(result[1].content).toContain(
        'export * from "./presets/light"',
      )
    })

    it('creates empty export sections when no names are provided', () => {
      const result = formatPackageFile(createPackageData())

      expect(result).toHaveLength(2)
      expect(result[0].content).not.toContain('export *')
      expect(result[1].content).not.toContain('export *')
    })
  })
})