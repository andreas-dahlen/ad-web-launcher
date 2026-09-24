import { describe, expect, it, vi } from 'vitest'

import {
  buildReport,
  type ReportSection,
} from '../../../src/diagnostics/report/buildReport.ts'
import type { DiagnosticData } from '../../../src/types/diagnostics.types.ts'
import type { CompilerConfig } from '../../../src/types/run.types.ts'

vi.mock('../../../src/diagnostics/report/sections/verbose/headerSection.ts', () => ({
  headerSection: vi.fn(() => ({ title: 'header', entries: [] })),
}))

vi.mock('../../../src/diagnostics/report/sections/verbose/tokenSection.ts', () => ({
  tokenSection: vi.fn(() => ({ title: 'tokens', entries: [] })),
}))

vi.mock('../../../src/diagnostics/report/sections/verbose/presetSection.ts', () => ({
  presetSection: vi.fn(() => ({ title: 'presets', entries: [] })),
}))

vi.mock('../../../src/diagnostics/report/sections/verbose/singleFileSection.ts', () => ({
  singleFileSection: vi.fn(() => ({ title: 'single files', entries: [] })),
}))

vi.mock('../../../src/diagnostics/report/sections/verbose/patchesSection.ts', () => ({
  patchesSection: vi.fn(() => ({ title: 'patches', entries: [] })),
}))

vi.mock('../../../src/diagnostics/report/sections/summary/summarySection.ts', () => ({
  summarySection: vi.fn(() => ({ title: 'summary', entries: [] })),
}))

vi.mock('../../../src/diagnostics/report/sections/problems/omittedPresetSection.ts', () => ({
  omittedPresetSection: vi.fn(() => { }),
}))

vi.mock('../../../src/diagnostics/report/sections/problems/variableSection.ts', () => ({
  variableSection: vi.fn(() => { }),
}))

vi.mock('../../../src/diagnostics/report/sections/problems/selectorSection.ts', () => ({
  selectorSection: vi.fn(() => { }),
}))

vi.mock('../../../src/diagnostics/report/sections/problems/classSection.ts', () => ({
  classSection: vi.fn(() => { }),
}))

vi.mock('../../../src/diagnostics/report/sections/problems/invalidVarSection.ts', () => ({
  invalidVarSection: vi.fn(() => { }),
}))

vi.mock('../../../src/diagnostics/report/sections/problems/fileSection.ts', () => ({
  fileSection: vi.fn(() => { }),
}))

vi.mock('../../../src/diagnostics/report/sections/problems/issuesSection.ts', () => ({
  issuesSection: vi.fn(() => { }),
}))

function createData(
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
      package: { written: [], skipped: [] },
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

function createConfig(
  emissions: CompilerConfig['logging']['emissions'],
): CompilerConfig {
  return {
    logging: {
      emissions,
    },
    outputs: {
      tokens: false,
      presets: false,
      meta: false,
      lsp: false,
      extension: false,
      schema: false,
      pathPatches: false,
      package: false,
    },
  } as CompilerConfig
}

describe('[DIAGNOSTICS]', () => {
  describe('buildReport', () => {
    it('builds verbose emission sections', () => {
      const result = buildReport(
        createData(),
        createConfig('verbose'),
      )

      expect(result.map(section => section.title)).toEqual([
        'header',
        'tokens',
        'presets',
        'single files',
        'patches',
      ])
    })

    it('builds a summary emission section', () => {
      const result = buildReport(
        createData(),
        createConfig('summary'),
      )

      expect(result.map(section => section.title)).toEqual([
        'summary',
      ])
    })

    it('omits emission sections when logging is off', () => {
      const result = buildReport(
        createData(),
        createConfig('off'),
      )

      expect(result).toEqual([])
    })

    it('appends diagnostic sections in order', async () => {
      const createSection = (title: string): ReportSection => ({
        title,
        entries: [],
      })

      const { omittedPresetSection } = await import(
        '../../../src/diagnostics/report/sections/problems/omittedPresetSection.ts'
      )
      const { variableSection } = await import(
        '../../../src/diagnostics/report/sections/problems/variableSection.ts'
      )
      const { selectorSection } = await import(
        '../../../src/diagnostics/report/sections/problems/selectorSection.ts'
      )
      const { classSection } = await import(
        '../../../src/diagnostics/report/sections/problems/classSection.ts'
      )
      const { invalidVarSection } = await import(
        '../../../src/diagnostics/report/sections/problems/invalidVarSection.ts'
      )
      const { fileSection } = await import(
        '../../../src/diagnostics/report/sections/problems/fileSection.ts'
      )
      const { issuesSection } = await import(
        '../../../src/diagnostics/report/sections/problems/issuesSection.ts'
      )

      vi.mocked(omittedPresetSection).mockReturnValue(createSection('omitted'))
      vi.mocked(variableSection).mockReturnValue(createSection('variable'))
      vi.mocked(selectorSection).mockReturnValue(createSection('selector'))
      vi.mocked(classSection).mockReturnValue(createSection('class'))
      vi.mocked(invalidVarSection).mockReturnValue(createSection('invalid'))
      vi.mocked(fileSection).mockReturnValue(createSection('file'))
      vi.mocked(issuesSection).mockReturnValue(createSection('issues'))

      const result = buildReport(
        createData(),
        createConfig('off'),
      )

      expect(result.map(section => section.title)).toEqual([
        'omitted',
        'variable',
        'selector',
        'class',
        'invalid',
        'file',
        'issues',
      ])
    })
  })
})