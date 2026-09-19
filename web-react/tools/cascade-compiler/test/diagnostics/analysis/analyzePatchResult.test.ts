import { describe, expect, it } from 'vitest'

import { analyzePatchResult } from '../../../src/diagnostics/analysis/analyzers/analyzePatchResult.ts'

describe('[DIAGNOSTICS]', () => {
  describe('analyzePatchResult', () => {
    it('returns empty patch results when no result exists', () => {
      expect(analyzePatchResult(undefined)).toEqual({
        css: {
          written: [],
          skipped: []
        },
        jsonc: {
          written: [],
          skipped: []
        }
      })
    })

    it('groups written and skipped patches by file kind', () => {
      const result = analyzePatchResult({
        written: [
          {
            kind: 'css',
            outputFile: 'z.css'
          },
          {
            kind: 'jsonc',
            outputFile: 'b.jsonc'
          }
        ],
        skipped: [
          {
            kind: 'css',
            outputFile: 'a.css'
          },
          {
            kind: 'jsonc',
            outputFile: 'z.jsonc'
          }
        ]
      })

      expect(result).toEqual({
        css: {
          written: ['z.css'],
          skipped: ['a.css']
        },
        jsonc: {
          written: ['b.jsonc'],
          skipped: ['z.jsonc']
        }
      })
    })

    it('sorts written and skipped files', () => {
      const result = analyzePatchResult({
        written: [
          {
            kind: 'css',
            outputFile: 'z.css'
          },
          {
            kind: 'css',
            outputFile: 'a.css'
          }
        ],
        skipped: [
          {
            kind: 'css',
            outputFile: 'y.css'
          },
          {
            kind: 'css',
            outputFile: 'b.css'
          }
        ]
      })

      expect(result.css.written).toEqual([
        'a.css',
        'z.css'
      ])

      expect(result.css.skipped).toEqual([
        'b.css',
        'y.css'
      ])
    })
  })
})