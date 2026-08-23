import { describe, expect, it } from 'vitest'

import { assembleTokenData } from '../../../../emitters/extract/assemblers/assembleTokenData.js'
import type {
  CompilerToken,
  CssTokenGroup,
} from '../../../../types/compiler.types.js'
import type { ValidPrefix } from '../../../../oldSharedUtils/oldSharedCompiler.types.js'

function createToken(
  overrides: Partial<CompilerToken> = {},
): CompilerToken {
  return {
    name: 'button',
    infix: 'button',
    tokenPath: '/tokens/button/default.jsonc',
    vars: [],
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

describe('[EMITTERS]', () => {
  describe('assembleTokenData', () => {
    it('builds names from the group name', () => {
      const result = assembleTokenData(
        createGroup({
          groupPath: '/tokens/button',
        }),
      )

      expect(result).toMatchObject({
        name: 'button',
        styleName: 'buttonStyle',
        typeName: 'ButtonStyle',
      })
    })

    it('builds the generated token file path', () => {
      const result = assembleTokenData(
        createGroup({
          groupPath: '/tokens/button',
        }),
      )

      expect(result.tokenFile).toContain(
        '/src/shared/generated/tokenModules/button.token.ts',
      )
    })

    it('extracts the group name before converting it', () => {
      const result = assembleTokenData(
        createGroup({
          groupPath: '/styleTokens/components/button',
        }),
      )

      expect(result.name).toBe('button')
      expect(result.styleName).toBe('buttonStyle')
      expect(result.typeName).toBe('ButtonStyle')
    })

    it('collects token infixes', () => {
      const result = assembleTokenData(
        createGroup({
          tokens: [
            createToken({
              infix: 'button',
            }),
            createToken({
              name: 'hover',
              infix: 'button_hover',
              tokenPath: '/tokens/button/hover.jsonc',
            }),
          ],
        }),
      )

      expect(result.tokens).toEqual([
        {
          infix: 'button',
          variables: [],
        },
        {
          infix: 'button_hover',
          variables: [],
        },
      ])
    })

    it('assembles variables from each token', () => {
      const allowed = ['o', 's'] as ValidPrefix[]

      const result = assembleTokenData(
        createGroup({
          tokens: [
            createToken({
              vars: [
                {
                  name: "buttonColor",
                  cssName: 'button-color',
                  key: 'color',
                  effectiveAllowed: allowed,
                  values: {
                    o: '#fff',
                    s: '#000',
                  },
                },
              ],
            }),
          ],
        }),
      )

      expect(result.tokens).toEqual([
        {
          infix: 'button',
          variables: [
            {
              cssName: 'button-color',
              key: 'color',
              allowed,
              values: {
                o: '#fff',
                s: '#000',
              },
            },
          ],
        },
      ])
    })

    it('assembles variables independently for multiple tokens', () => {
      const result = assembleTokenData(
        createGroup({
          tokens: [
            createToken({
              infix: 'button',
              vars: [
                {
                  name: "buttonColor",
                  cssName: 'button-color',
                  key: 'color',
                  effectiveAllowed: ['o'] as ValidPrefix[],
                  values: {
                    o: '#fff',
                  },
                },
              ],
            }),
            createToken({
              infix: 'button_hover',
              vars: [
                {
                  name: "buttonColor",
                  cssName: 'button-hover-color',
                  key: 'color',
                  effectiveAllowed: ['s'] as ValidPrefix[],
                  values: {
                    s: '#000',
                  },
                },
              ],
            }),
          ],
        }),
      )

      expect(result.tokens).toEqual([
        {
          infix: 'button',
          variables: [
            {
              cssName: 'button-color',
              key: 'color',
              allowed: ['o'],
              values: {
                o: '#fff',
              },
            },
          ],
        },
        {
          infix: 'button_hover',
          variables: [
            {
              cssName: 'button-hover-color',
              key: 'color',
              allowed: ['s'],
              values: {
                s: '#000',
              },
            },
          ],
        },
      ])
    })

    it('returns empty token data when the group has no tokens', () => {
      const result = assembleTokenData(
        createGroup({
          tokens: [],
        }),
      )

      expect(result.tokens).toEqual([])
    })

    it('does not modify the source group', () => {
      const group = createGroup({
        tokens: [
          createToken({
            vars: [
              {
                name: "buttonColor",
                cssName: 'button-color',
                key: 'color',
                effectiveAllowed: ['o'] as ValidPrefix[],
                values: {
                  o: '#fff',
                },
              },
            ],
          }),
        ],
      })

      const originalGroup = structuredClone(group)

      assembleTokenData(group)

      expect(group).toEqual(originalGroup)
    })
  })
})