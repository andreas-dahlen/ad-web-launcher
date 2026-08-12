import { describe, expect, it } from 'vitest'

import { analyzeVariableDeclarations } from '@styleTokens/diagnostics/data/analyzers/analyzeVariableDeclarations'
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
    name: 'backGround',
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
  describe('analyzeVariableDeclarations', () => {
    it('ignores declarations with an allowed prefix', () => {
      const cssData = createCssData({
        declaredVariables: [
          '--f-button-back-ground',
        ],
      })

      const group = createGroup()

      expect(
        analyzeVariableDeclarations(cssData, group),
      ).toEqual([])
    })

    it('reports declarations with a disallowed prefix', () => {
      const cssData = createCssData({
        declaredVariables: [
          '--p-button-back-ground',
        ],
      })

      const group = createGroup()

      expect(
        analyzeVariableDeclarations(cssData, group),
      ).toEqual([
        {
          name: 'Button',
          infix: 'button',
          invalid: [
            '--p-button-back-ground',
          ],
        },
      ])
    })

    it('ignores unrelated declarations', () => {
      const cssData = createCssData({
        declaredVariables: [
          '--f-other-back-ground',
          '--p-surface-color',
          '--random-value',
        ],
      })

      const group = createGroup()

      expect(
        analyzeVariableDeclarations(cssData, group),
      ).toEqual([])
    })

    it('reports multiple invalid declarations for one token', () => {
      const cssData = createCssData({
        declaredVariables: [
          '--p-button-back-ground',
          '--m-button-back-ground',
          '--s-button-back-ground',
        ],
      })

      const group = createGroup()

      expect(
        analyzeVariableDeclarations(cssData, group),
      ).toEqual([
        {
          name: 'Button',
          infix: 'button',
          invalid: [
            '--p-button-back-ground',
            '--m-button-back-ground',
            '--s-button-back-ground',
          ],
        },
      ])
    })

    it('allows multiple configured prefixes', () => {
      const cssData = createCssData({
        declaredVariables: [
          '--f-button-back-ground',
          '--p-button-back-ground',
          '--m-button-back-ground',
        ],
      })

      const group = createGroup({
        tokens: [
          createToken({
            vars: [
              createVariable({
                effectiveAllowed: ['p', 'f'],
              }),
            ],
          }),
        ],
      })

      expect(
        analyzeVariableDeclarations(cssData, group),
      ).toEqual([
        {
          name: 'Button',
          infix: 'button',
          invalid: [
            '--m-button-back-ground',
          ],
        },
      ])
    })

    it('analyzes variables independently', () => {
      const cssData = createCssData({
        declaredVariables: [
          '--p-button-back-ground',
          '--p-button-color',
        ],
      })

      const group = createGroup({
        tokens: [
          createToken({
            vars: [
              createVariable({
                name: 'backGround',
                cssName: 'back-ground',
                effectiveAllowed: ['p'],
              }),
              createVariable({
                key: 'color',
                name: 'color',
                cssName: 'color',
                effectiveAllowed: ['f'],
              }),
            ],
          }),
        ],
      })

      expect(
        analyzeVariableDeclarations(cssData, group),
      ).toEqual([
        {
          name: 'Button',
          infix: 'button',
          invalid: [
            '--p-button-color',
          ],
        },
      ])
    })

    it('returns an empty array when there are no declarations', () => {
      const cssData = createCssData()
      const group = createGroup()

      expect(
        analyzeVariableDeclarations(cssData, group),
      ).toEqual([])
    })
  })
})