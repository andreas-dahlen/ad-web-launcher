import { describe, expect, it, vi } from 'vitest'

import { singleFileSection } from '../../../../src/diagnostics/report/sections/verbose/singleFileSection.ts'
import type { GeneratedFiles } from '../../../../src/types/diagnostics.types.ts'
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

function createGeneratedFiles(
  overrides: Partial<GeneratedFiles> = {},
): GeneratedFiles {
  return {
    tokens: {
      written: [],
      skipped: [],
    },
    presets: {
      written: [],
      skipped: [],
    },
    meta: {
      written: [],
      skipped: [],
    },
    lsp: {
      written: [],
      skipped: [],
    },
    extension: {
      written: [],
      skipped: [],
    },
    schema: {
      written: [],
      skipped: [],
    },
    package: {
      written: [],
      skipped: [],
    },
    ...overrides,
  }
}

function createOutputs(
  overrides: Partial<CompilerOutputs> = {},
): CompilerOutputs {
  return {
    tokens: false,
    presets: false,
    meta: false,
    lsp: false,
    extension: false,
    schema: false,
    pathPatches: false,
    package: false,
    ...overrides,
  }
}

describe('[DIAGNOSTICS]', () => {
  describe('singleFileSection', () => {
    it('creates entries for written and skipped files', () => {
      const result = singleFileSection(
        createGeneratedFiles({
          meta: {
            written: ['meta.json'],
            skipped: ['old-meta.json'],
          },
        }),
        createOutputs({
          meta: true
        }),
      )

      expect(result.entries.some(entry =>
        entry.title.includes('meta.json') &&
        entry.title.includes('✔️'),
      )).toBe(true)

      expect(result.entries.some(entry =>
        entry.title.includes('old-meta.json') &&
        entry.title.includes('⏩'),
      )).toBe(true)
    })

    it('reports the total number of generated files', () => {
      const result = singleFileSection(
        createGeneratedFiles({
          meta: {
            written: ['meta.json'],
            skipped: ['old-meta.json'],
          },
          lsp: {
            written: ['lsp.json'],
            skipped: [],
          },
        }),
        createOutputs({
          meta: true,
          lsp: true,
        }),
      )

      expect(result.title).toContain('3')
    })

    it('throws when an enabled output produces no file', () => {
      expect(() =>
        singleFileSection(
          createGeneratedFiles(),
          createOutputs({
            meta: true,
          }),
        ),
      ).toThrow(
        'Output "meta" was enabled but produced no reported file / skipped output.',
      )
    })

    it('reports disabled outputs', () => {
      const result = singleFileSection(
        createGeneratedFiles(),
        createOutputs({
          meta: false,
          lsp: false,
          extension: false,
          schema: false,
        }),
      )

      const titles = result.entries.map(entry => entry.title)

      expect(titles.every(title =>
        title.includes('Disabled ☠️'),
      )).toBe(true)

      expect(titles.some(title =>
        title.includes('meta'),
      )).toBe(true)

      expect(titles.some(title =>
        title.includes('lsp'),
      )).toBe(true)

      expect(titles.some(title =>
        title.includes('extension'),
      )).toBe(true)

      expect(titles.some(title =>
        title.includes('schema'),
      )).toBe(true)
    })
  })
})