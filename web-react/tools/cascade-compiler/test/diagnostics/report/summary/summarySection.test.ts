import { describe, expect, it, vi } from 'vitest'

import { summarySection } from '../../../../src/diagnostics/report/sections/summary/summarySection.ts'
import type { DiagnosticData } from '../../../../src/types/diagnostics.types.ts'
import type { CompilerOutputs } from '../../../../src/types/run.types.ts'

vi.mock('../../../../../utils/string', () => ({
  colors: {
    heading: 'heading',
    value: 'value',
  },

  paint: String,
  emitValueMsg: (written: string[], isEnabled: boolean) =>
    `${written.length}/${isEnabled ? 'enabled' : 'disabled'}`,
}))

function createDiagnosticData(
  overrides: Partial<DiagnosticData> = {},
): DiagnosticData {
  return {
    processedGroupCount: 1,

    generatedFiles: {
      tokens: { written: [], skipped: [] },
      presets: { written: [], skipped: [] },
      meta: { written: [], skipped: [] },
      lsp: { written: [], skipped: [] },
      extension: { written: [], skipped: [] },
      schema: { written: [], skipped: [] },
      package: { written: [], skipped: [] }
    },

    generatedPatches: {
      css: { written: [], skipped: [] },
      jsonc: { written: [], skipped: [] },
    },

    omittedPresetFiles: [],
    mismatchedVariables: [],
    unusableSelectors: [],
    missingClasses: [],
    invalidVarDeclarations: [],
    missingCssModules: [],
    issues: [],

    ...overrides,
  }
}

function createOutputs(): CompilerOutputs {
  return {
    tokens: true,
    presets: true,
    meta: true,
    lsp: true,
    extension: true,
    schema: true,
    pathPatches: true,
    package: true
  }
}

describe('[DIAGNOSTICS]', () => {
  describe('summarySection', () => {
    it('creates an update summary for a single processed group', () => {
      const result = summarySection(
        createDiagnosticData(),
        createOutputs(),
      )

      expect(result.title).toContain('Update complete!')
      expect(result.entries).toHaveLength(8)
    })

    it('creates an initialization summary for multiple processed groups', () => {
      const result = summarySection(
        createDiagnosticData({
          processedGroupCount: 2,
        }),
        createOutputs(),
      )

      expect(result.title).toContain('Initialization complete!')
      expect(result.title).toContain('2')
    })

    it('reports generated file counts and patch counts', () => {
      const result = summarySection(
        createDiagnosticData({
          generatedFiles: {
            tokens: {
              written: ['button.jsonc'],
              skipped: [],
            },
            presets: {
              written: ['button.css'],
              skipped: [],
            },
            meta: {
              written: ['meta.json'],
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
              written: ['schema.json'],
              skipped: [],
            },
            package: {
              written: [],
              skipped: []
            }
          },
          generatedPatches: {
            css: {
              written: ['button.css'],
              skipped: [],
            },
            jsonc: {
              written: ['button.jsonc'],
              skipped: [],
            },
          },
        }),
        createOutputs(),
      )

      const titles = result.entries.map(entry => entry.title)

      expect(titles.some(title => title.includes('Token files'))).toBe(true)
      expect(titles.some(title => title.includes('Preset files'))).toBe(true)
      expect(titles.some(title => title.includes('Css patches'))).toBe(true)
      expect(titles.some(title => title.includes('Jsonc patches'))).toBe(true)
    })
  })
})