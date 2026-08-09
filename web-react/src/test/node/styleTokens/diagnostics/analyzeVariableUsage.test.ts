import { describe, expect, it } from 'vitest'

import { analyzeVariableUsage } from '@styleTokens/diagnostics/data/analyzers/analyzeVariableUsage'
import type {
  CompilerToken,
  CompilerVariable,
  CssData,
  CssTokenGroup,
} from '@styleTokens/types/compiler.types'

function createVariable(
  overrides: Partial<CompilerVariable> = {},
): CompilerVariable {
  return {
    key: 'bg',
    name: 'background',
    values: {},
    effectiveAllowed: ['f'],
    ...overrides,
  }
}

function createToken(
  overrides: Partial<CompilerToken> = {},
): CompilerToken {
  return {
    name: 'Button',
    infix: 'button',
    tokenPath: '/tokens/button.jsonc',
    vars: [
      createVariable(),
    ],
    ...overrides,
  }
}

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

function createGroup(
  overrides: Partial<CssTokenGroup> = {},
): CssTokenGroup {
  return {
    groupPath: '/tokens/button',
    cssPath: '/components/Button/Button.module.css',
    tokens: [
      createToken(),
    ],
    ...overrides,
  }
}

describe('[DIAGNOSTICS]', () => {
  describe('analyzeVariableUsage', () => {
    it('returns no mismatch when usage matches declarations', () => {
      const cssData = createCssData({
        foundFinalVariables: [
          '--final-button-background',
        ],
      })

      const group = createGroup()

      expect(
        analyzeVariableUsage(cssData, group),
      ).toEqual([])
    })

    it('reports a final variable used by CSS but missing from the token', () => {
      const cssData = createCssData({
        foundFinalVariables: [
          '--final-button-background',
          '--final-button-color',
        ],
      })

      const group = createGroup()

      expect(
        analyzeVariableUsage(cssData, group),
      ).toEqual([
        {
          name: 'Button',
          infix: 'button',
          missing: [
            '--final-button-color',
          ],
          unused: [],
        },
      ])
    })

    it('reports a declared variable that is not used by CSS', () => {
      const cssData = createCssData({
        foundFinalVariables: [],
      })

      const group = createGroup()

      expect(
        analyzeVariableUsage(cssData, group),
      ).toEqual([
        {
          name: 'Button',
          infix: 'button',
          missing: [],
          unused: [
            '--final-button-background',
          ],
        },
      ])
    })

    it('reports both missing and unused variables', () => {
      const cssData = createCssData({
        foundFinalVariables: [
          '--final-button-color',
        ],
      })

      const group = createGroup({
        tokens: [
          createToken({
            vars: [
              createVariable({
                name: 'background',
              }),
              createVariable({
                key: 'border',
                name: 'border',
              }),
            ],
          }),
        ],
      })

      expect(
        analyzeVariableUsage(cssData, group),
      ).toEqual([
        {
          name: 'Button',
          infix: 'button',
          missing: [
            '--final-button-color',
          ],
          unused: [
            '--final-button-background',
            '--final-button-border',
          ],
        },
      ])
    })

    it('ignores final variables belonging to another token', () => {
      const cssData = createCssData({
        foundFinalVariables: [
          '--final-surface-background',
        ],
      })

      const group = createGroup()

      expect(
        analyzeVariableUsage(cssData, group),
      ).toEqual([
        {
          name: 'Button',
          infix: 'button',
          missing: [],
          unused: [
            '--final-button-background',
          ],
        },
      ])
    })

    it('analyzes tokens independently', () => {
      const cssData = createCssData({
        foundFinalVariables: [
          '--final-button-background',
          '--final-surface-color',
        ],
      })

      const group = createGroup({
        tokens: [
          createToken({
            name: 'Button',
            infix: 'button',
            vars: [
              createVariable({
                name: 'background',
              }),
            ],
          }),
          createToken({
            name: 'Surface',
            infix: 'surface',
            vars: [
              createVariable({
                key: 'color',
                name: 'color',
              }),
            ],
          }),
        ],
      })

      expect(
        analyzeVariableUsage(cssData, group),
      ).toEqual([])
    })

    it('returns an empty array when there are no declarations or usage', () => {
      const cssData = createCssData()
      const group = createGroup({
        tokens: [
          createToken({
            vars: [],
          }),
        ],
      })

      expect(
        analyzeVariableUsage(cssData, group),
      ).toEqual([])
    })
  })
})