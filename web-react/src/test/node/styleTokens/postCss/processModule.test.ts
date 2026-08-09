import { describe, expect, it } from 'vitest'
import postcss from 'postcss'
import type { Root } from 'postcss'

import { processModule } from '@styleTokens/postCss/processModule'
import type {
  CompilerToken,
  CompilerVariable,
  CssTokenGroup,
} from '@styleTokens/types/compiler.types'

function parseCss(css: string): Root {
  return postcss.parse(css)
}

function createVariable(
  overrides: Partial<CompilerVariable> = {},
): CompilerVariable {
  return {
    key: 'bg',
    name: 'background',
    values: {
      f: 'red',
    },
    effectiveAllowed: ['f'],
    ...overrides,
  }
}

function createToken(
  overrides: Partial<CompilerToken> = {},
): CompilerToken {
  return {
    name: 'button',
    infix: 'button',
    tokenPath: '/tokens/button/default.jsonc',
    vars: [createVariable()],
    ...overrides,
  }
}

function createGroup(
  overrides: Partial<CssTokenGroup> = {},
): CssTokenGroup {
  return {
    groupPath: '/tokens/button',
    cssPath: '/components/Button/Button.module.css',
    tokens: [createToken()],
    ...overrides,
  }
}

function getRule(root: Root, selector: string) {
  const rule = root.nodes?.find(
    node => node.type === 'rule' && node.selector === selector,
  )

  if (!rule || rule.type !== 'rule') {
    throw new Error(`Expected rule ${selector}`)
  }

  return rule
}

function getDeclarations(root: Root, selector: string) {
  return getRule(root, selector).nodes?.filter(
    node => node.type === 'decl',
  ) ?? []
}

describe('[POSTCSS]', () => {
  describe('processModule', () => {
    it('processes every token with a matching rule', () => {
      const root = parseCss(`
        .button {
          color: red;
        }

        .surface {
          color: blue;
        }
      `)

      const group = createGroup({
        tokens: [
          createToken(),
          createToken({
            name: 'surface',
            infix: 'surface',
            tokenPath: '/tokens/surface/default.jsonc',
            vars: [
              createVariable({
                name: 'border-radius',
              }),
            ],
          }),
        ],
      })

      const result = processModule({
        root,
        group,
      })

      expect(result.tokens).toEqual([
        {
          name: 'button',
          infix: 'button',
          tokenPath: '/tokens/button/default.jsonc',
          processed: true,
        },
        {
          name: 'surface',
          infix: 'surface',
          tokenPath: '/tokens/surface/default.jsonc',
          processed: true,
        },
      ])
    })

    it('marks tokens without a matching rule as unprocessed', () => {
      const root = parseCss(`
        .other {
          color: red;
        }
      `)

      const result = processModule({
        root,
        group: createGroup(),
      })

      expect(result.tokens).toEqual([
        {
          name: 'button',
          infix: 'button',
          tokenPath: '/tokens/button/default.jsonc',
          processed: false,
        },
      ])
    })

    it('injects variable definitions and the final cascade', () => {
      const root = parseCss(`
        .button {
          color: red;
        }
      `)

      processModule({
        root,
        group: createGroup({
          tokens: [
            createToken({
              vars: [
                // eslint-disable-next-line unicorn/max-nested-calls
                createVariable({
                  values: {
                    f: 'red',
                  },
                  effectiveAllowed: ['f'],
                }),
              ],
            }),
          ],
        }),
      })

      const declarations = getDeclarations(root, '.button')

      expect(declarations).toContainEqual(
        expect.objectContaining({
          prop: '--f-button-background',
          value: 'red',
        }),
      )

      expect(declarations).toContainEqual(
        expect.objectContaining({
          prop: '--final-button-background',
          value: 'var(--f-button-background)',
        }),
      )
    })

    it('injects preset resets when the preset prefix is allowed', () => {
      const root = parseCss(`
        .button {
          color: var(--final-button-background);
        }
      `)

      processModule({
        root,
        group: createGroup({
          tokens: [
            createToken({
              vars: [
                // eslint-disable-next-line unicorn/max-nested-calls
                createVariable({
                  effectiveAllowed: ['p', 'f'],
                }),
              ],
            }),
          ],
        }),
      })

      const declarations = getDeclarations(root, '.button')

      expect(declarations).toContainEqual(
        expect.objectContaining({
          prop: '--p-button-background',
          value: 'initial',
        }),
      )
    })

    it('does not mutate the CSS when mutate is false', () => {
      const root = parseCss(`
        .button {
          color: var(--final-button-background);
        }
      `)

      const before = root.toString()

      const result = processModule({
        root,
        group: createGroup(),
        mutate: false,
      })

      expect(root.toString()).toBe(before)

      expect(result.tokens).toEqual([
        {
          name: 'button',
          infix: 'button',
          tokenPath: '/tokens/button/default.jsonc',
          processed: true,
        },
      ])

      expect(result.foundFinalVariables).toEqual([
        '--final-button-background',
      ])
    })

    it('returns the analysis collected while processing', () => {
      const root = parseCss(`
        .button {
          --s-button-background: red;
          color: var(--final-button-background);
        }

        .other {
          color: blue;
        }
      `)

      const result = processModule({
        root,
        group: createGroup(),
        mutate: false,
      })

      expect(result.groupPath).toBe('/tokens/button')
      expect(result.cssPath).toBe(
        '/components/Button/Button.module.css',
      )

      expect(result.foundSelectors).toEqual([
        'button',
        'other',
      ])

      expect(result.usableSelectors).toEqual([
        'button',
        'other',
      ])

      expect(result.declaredVariables).toEqual([
        '--s-button-background',
      ])

      expect(result.foundFinalVariables).toEqual([
        '--final-button-background',
      ])
    })
  })
})