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
    cssName: 'back-ground',
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
          '--final-button-back-ground',
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
          '--final-button-back-ground',
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
            '--final-button-back-ground',
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
                name: 'back-ground',
              }),
              createVariable({
                key: 'border',
                name: 'border',
                cssName: 'border'
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
            '--final-button-back-ground',
            '--final-button-border',
          ],
        },
      ])
    })

    it('ignores final variables belonging to another token', () => {
      const cssData = createCssData({
        foundFinalVariables: [
          '--final-surface-back-ground',
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
            '--final-button-back-ground',
          ],
        },
      ])
    })

    it('analyzes tokens independently', () => {
      const cssData = createCssData({
        foundFinalVariables: [
          '--final-button-back-ground',
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
                name: 'backGround',
                cssName: 'back-ground',
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
                cssName: 'color'
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