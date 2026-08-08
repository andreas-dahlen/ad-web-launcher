import { describe, expect, it } from 'vitest'

import { assemblePresetData } from '@styleTokens/emitters/extract/assemblers/assemblePresetData'
import type { CssData } from '@styleTokens/types/compiler.types'
import path from 'node:path'

function createCssData(
  overrides: Partial<CssData> = {},
): CssData {
  return {
    groupPath: '/tokens/button',
    cssPath: '/components/Button/Button.module.css',
    foundSelectors: [],
    usableSelectors: [],
    foundFinalVariables: [],
    declaredVariables: [],
    tokens: [],
    ...overrides,
  }
}

describe('[EMITTERS]', () => {
  describe('assemblePresetData', () => {
    it('builds preset names from the group name', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
        }),
      )

      expect(result).toMatchObject({
        presetName: 'buttonPreset',
        typeName: 'ButtonPreset',
      })
    })

    it('builds the generated preset file path', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
        }),
      )

      expect(result?.presetFile).toContain(
        '/src/shared/generated/presets/button.preset.ts',
      )
    })

    it('creates a relative CSS import path', () => {
      const generatedDir = path.resolve(
        './src/shared/generated/presets',
      )

      const cssPath = path.resolve(
        './src/components/Button/Button.module.css',
      )

      const result = assemblePresetData(
        createCssData({ cssPath }),
      )

      expect(result?.cssImport).toBe(
        path.relative(generatedDir, cssPath),
      )
    })

    it('normalizes Windows path separators in the CSS import', () => {
      const result = assemblePresetData(
        createCssData({
          cssPath: String.raw`C:\\project\\src\\components\\Button\\Button.module.css`,
        }),
      )

      expect(result?.cssImport).not.toContain('\\')
    })

    it('passes usable selectors through unchanged', () => {
      const selectors = [
        'button',
        'button_$state',
        'active',
      ]

      const result = assemblePresetData(
        createCssData({
          usableSelectors: selectors,
        }),
      )

      expect(result?.selectors).toEqual(selectors)
    })

    it('preserves the CSS path in the generated import', () => {
      const result = assemblePresetData(
        createCssData({
          cssPath: '/components/Layout/Layout.module.css',
        }),
      )

      expect(result?.cssImport).toContain(
        'Layout/Layout.module.css',
      )
    })
  })
})