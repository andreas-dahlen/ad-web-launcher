import { describe, expect, it, vi } from 'vitest'

import { patchesSection } from '../../../../src/diagnostics/report/sections/verbose/patchesSection.ts'
import type { GeneratedPatches } from '../../../../src/types/diagnostics.types.ts'
import type { CompilerOutputs } from '../../../../src/types/run.types.ts'

vi.mock('../../../../../utils/string', () => ({
  colors: {
    heading: 'heading',
    value: 'value',
    muted: 'muted',
    file: 'file',
  },

  paint: String,
  emitValueMsg: (files: string[]) => `${files.length} files`,
  formatLogPath: (value: string) => value,
}))

function createGeneratedPatches(
  overrides: Partial<GeneratedPatches> = {},
): GeneratedPatches {
  return {
    css: {
      written: [],
      skipped: [],
    },
    jsonc: {
      written: [],
      skipped: [],
    },
    ...overrides,
  }
}

function createOutputs(
  willPathPatch = false,
): CompilerOutputs {
  return {
    tokens: false,
    presets: false,
    meta: false,
    lsp: false,
    extension: false,
    schema: false,
    package: false,
    pathPatches: willPathPatch,
  }
}

describe('[DIAGNOSTICS]', () => {
  describe('patchesSection', () => {
    it('creates entries for written and skipped files', () => {
      const result = patchesSection(
        createGeneratedPatches({
          css: {
            written: ['button.css'],
            skipped: ['card.css'],
          },
          jsonc: {
            written: ['button.jsonc'],
            skipped: ['card.jsonc'],
          },
        }),
        createOutputs(),
      )

      expect(result.entries).toHaveLength(4)

      expect(result.entries[0].title).toContain('button.css')
      expect(result.entries[0].title).toContain('✔️')

      expect(result.entries[1].title).toContain('card.css')
      expect(result.entries[1].title).toContain('⏩')

      expect(result.entries[2].title).toContain('button.jsonc')
      expect(result.entries[2].title).toContain('✔️')

      expect(result.entries[3].title).toContain('card.jsonc')
      expect(result.entries[3].title).toContain('⏩')
    })

    it('reports the total number of patched files', () => {
      const result = patchesSection(
        createGeneratedPatches({
          css: {
            written: ['button.css'],
            skipped: ['card.css'],
          },
          jsonc: {
            written: ['button.jsonc'],
            skipped: [],
          },
        }),
        createOutputs(),
      )

      expect(result.title).toContain('3')
    })

    it('returns an empty section when no files were patched and output is disabled', () => {
      const result = patchesSection(
        createGeneratedPatches(),
        createOutputs(),
      )

      expect(result.title).toContain('File patches')
      expect(result.title).toContain('☠️')
      expect(result.entries).toEqual([])
    })

    it('throws when path patches are enabled but no files were patched', () => {
      expect(() =>
        patchesSection(
          createGeneratedPatches(),
          createOutputs(true),
        ),
      ).toThrow(
        'Output "pathPatches" was enabled but produced no patched file.',
      )
    })
  })
})