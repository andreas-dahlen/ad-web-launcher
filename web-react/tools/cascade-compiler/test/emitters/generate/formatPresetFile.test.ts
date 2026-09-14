import { describe, expect, it } from 'vitest'

import { assemblePresetData } from '../../../src/emitters/extract/assemblers/assemblePresetData.ts'
import type { CssData } from '../../../src/types/compiler.types.ts'

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
    it('builds preset data from the group name', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
          usableSelectors: ['button', 'primary'],
        }),
      )

      expect(result).toEqual({
        typeName: 'ButtonPreset',
        selectors: ['primary'],
        outputFile: 'presets/button.preset.ts',
      })
    })

    it('filters the base selector', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
          usableSelectors: [
            'button',
            'primary',
          ],
        }),
      )

      expect(result?.selectors).toEqual(['primary'])
    })

    it('filters utility selectors', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
          usableSelectors: [
            'primary',
            'focusUtil',
            'debugUtil',
          ],
        }),
      )

      expect(result?.selectors).toEqual(['primary'])
    })

    it('returns null when no preset selectors remain', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
          usableSelectors: [
            'button',
            'focusUtil',
            'debugUtil',
          ],
        }),
      )

      expect(result).toBeNull()
    })
  })
})