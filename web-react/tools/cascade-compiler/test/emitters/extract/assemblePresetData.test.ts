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
    usableSelectors: ['primary'],
    foundFinalVariables: [],
    declaredVariables: [],
    tokens: [],
    ...overrides,
  }
}

describe('[EMITTERS]', () => {
  describe('assemblePresetData', () => {
    it('builds the type name from the group name', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
        }),
      )

      expect(result?.typeName).toBe('ButtonPreset')
    })

    it('builds the generated preset file path', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
        }),
      )

      expect(result?.outputFile).toBe(
        'presets/button.preset.ts',
      )
    })

    it('filters non-preset selectors', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/button',
          usableSelectors: [
            'button',
            'button_$state',
            'active',
            'focusUtil',
          ],
        }),
      )

      expect(result?.selectors).toEqual([
        'button_$state',
        'active',
      ])
    })

    it('returns null when no preset selectors remain', () => {
      const result = assemblePresetData(
        createCssData({
          groupPath: '/tokens/svg',
          usableSelectors: [
            'svg',
            'focusUtil',
            'debugUtil',
          ],
        }),
      )

      expect(result).toBeNull()
    })

    it('preserves selectors in the assembled data', () => {
      const result = assemblePresetData(
        createCssData({
          usableSelectors: [
            'primary',
            'secondary',
            'disabled',
          ],
        }),
      )

      expect(result?.selectors).toEqual([
        'primary',
        'secondary',
        'disabled',
      ])
    })
  })
})