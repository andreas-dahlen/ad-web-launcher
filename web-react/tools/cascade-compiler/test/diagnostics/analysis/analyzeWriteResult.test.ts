import { describe, expect, it } from 'vitest'

import { analyzeWriteResult } from '../../../src/diagnostics/analysis/analyzers/analyzeWriteResult.ts'


describe('[DIAGNOSTICS]', () => {
  describe('analyzeWriteResult', () => {
    it('groups written preset and token files', () => {
      const result = analyzeWriteResult({
        written: [
          { outputFile: 'presets/button.preset.ts', kind: "presets" },
          { outputFile: 'tokenModules/button.token.ts', kind: "tokens" }
        ],
        skipped: [],
      })

      expect(result).toEqual({
        presets: {
          written: [
            'presets/button.preset.ts',
          ],
          skipped: [],
        },
        schema: {
          written: [],
          skipped: []
        },
        package: {
          skipped: [],
          written: [],
        },
        tokens: {
          written: [
            'tokenModules/button.token.ts',
          ],
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
      })
    })

    it('groups skipped preset and token files', () => {
      const result = analyzeWriteResult({
        written: [],
        skipped: [
          { outputFile: 'presets/button.preset.ts', kind: "presets" },
          { outputFile: 'tokenModules/button.token.ts', kind: "tokens" }
        ]
      })

      expect(result).toEqual({
        presets: {
          written: [],
          skipped: [
            'presets/button.preset.ts',
          ],
        },
        package: {
          skipped: [],
          written: [],
        },
        schema: {
          written: [],
          skipped: []
        },
        tokens: {
          written: [],
          skipped: [
            'tokenModules/button.token.ts',
          ],
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
      })
    })

    it('groups written metadata, lsp, and extension files', () => {
      const result = analyzeWriteResult({
        written: [
          { outputFile: 'metadata/metadata.jsonc', kind: "meta" },
          { outputFile: 'metadata/lsp.ts', kind: "lsp" },
          { outputFile: 'metadata/extension.jsonc', kind: "extension" }
        ],
        skipped: [],
      })

      expect(result).toEqual({
        presets: {
          written: [],
          skipped: [],
        },
        schema: {
          written: [],
          skipped: []
        },
        package: {
          skipped: [],
          written: [],
        },
        tokens: {
          written: [],
          skipped: [],
        },
        meta: {
          written: [
            'metadata/metadata.jsonc',
          ],
          skipped: [],
        },
        lsp: {
          written: [
            'metadata/lsp.ts',
          ],
          skipped: [],
        },
        extension: {
          written: [
            'metadata/extension.jsonc',
          ],
          skipped: [],
        },
      })
    })

    it('groups skipped metadata, lsp, and extension files', () => {
      const result = analyzeWriteResult({
        written: [],
        skipped: [
          { outputFile: 'metadata/metadata.jsonc', kind: "meta" },
          { outputFile: 'metadata/lsp.ts', kind: "lsp" },
          { outputFile: 'metadata/extension.jsonc', kind: "extension" }
        ],
      })

      expect(result).toEqual({
        presets: {
          written: [],
          skipped: [],
        },
        schema: {
          written: [],
          skipped: []
        },
        package: {
          skipped: [],
          written: [],
        },
        tokens: {
          written: [],
          skipped: [],
        },
        meta: {
          written: [],
          skipped: [
            'metadata/metadata.jsonc',
          ],
        },
        lsp: {
          written: [],
          skipped: [
            'metadata/lsp.ts',
          ],
        },
        extension: {
          written: [],
          skipped: [
            'metadata/extension.jsonc',
          ],
        },
      })
    })


    it('handles an undefined result', () => {
      expect(analyzeWriteResult(undefined)).toEqual({
        presets: {
          written: [],
          skipped: [],
        },
        schema: {
          written: [],
          skipped: [],
        },
        package: {
          skipped: [],
          written: [],
        },
        tokens: {
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
      })
    })

    it('sorts written and skipped preset and token files', () => {
      const result = analyzeWriteResult({
        written: [
          { outputFile: 'presets/zebra.preset.ts', kind: "presets" },
          { outputFile: 'presets/alpha.preset.ts', kind: "presets" },
          { outputFile: 'tokenModules/zebra.token.ts', kind: "tokens" },
          { outputFile: 'tokenModules/alpha.token.ts', kind: "tokens" },
        ],
        skipped: [
          { outputFile: 'presets/zulu.preset.ts', kind: "presets" },
          { outputFile: 'presets/bravo.preset.ts', kind: "presets" },
          { outputFile: 'tokenModules/zulu.token.ts', kind: "tokens" },
          { outputFile: 'tokenModules/bravo.token.ts', kind: "tokens" },
        ],
      })

      expect(result.presets).toEqual({
        written: [
          'presets/alpha.preset.ts',
          'presets/zebra.preset.ts',
        ],
        skipped: [
          'presets/bravo.preset.ts',
          'presets/zulu.preset.ts',
        ],
      })

      expect(result.tokens).toEqual({
        written: [
          'tokenModules/alpha.token.ts',
          'tokenModules/zebra.token.ts',
        ],
        skipped: [
          'tokenModules/bravo.token.ts',
          'tokenModules/zulu.token.ts',
        ],
      })
    })
  })
})