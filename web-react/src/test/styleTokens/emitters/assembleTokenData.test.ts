import { describe, expect, it } from 'vitest'

import { assembleTokenData } from '@styleTokens/emitters/extract/assemblers/assembleTokenData'
import type {
  CompilerToken,
  CompilerVariable,
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
    name: 'button',
    infix: 'button',
    tokenPath: '/tokens/button/default.jsonc',
    vars: [
      createVariable(),
    ],
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

      expect(result.name).toBe('button')
      expect(result.styleName).toBe('buttonStyle')
      expect(result.typeName).toBe('ButtonStyle')
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

    it('preserves token infixes', () => {
      const result = assembleTokenData(
        createGroup({
          tokens: [
            createToken({
              infix: 'button',
            }),
            createToken({
              infix: 'surface',
            }),
          ],
        }),
      )

      expect(result.tokens).toEqual([
        expect.objectContaining({
          infix: 'button',
        }),
        expect.objectContaining({
          infix: 'surface',
        }),
      ])
    })

    it('maps variable names, keys, and allowed prefixes', () => {
      const result = assembleTokenData(
        createGroup({
          tokens: [
            createToken({
              vars: [
                // eslint-disable-next-line unicorn/max-nested-calls
                createVariable({
                  key: 'bg',
                  name: 'background',
                  effectiveAllowed: ['f', 'p'],
                }),
              ],
            }),
          ],
        }),
      )

      expect(result.tokens[0]?.variables).toEqual([
        {
          name: 'background',
          key: 'bg',
          allowed: ['f', 'p'],
        },
      ])
    })

    it('falls back to the variable key when the name is missing', () => {
      const result = assembleTokenData(
        createGroup({
          tokens: [
            createToken({
              vars: [
                // eslint-disable-next-line unicorn/max-nested-calls
                createVariable({
                  key: 'bg',
                  name: undefined,
                }),
              ],
            }),
          ],
        }),
      )

      expect(result.tokens[0]?.variables).toEqual([
        {
          name: 'bg',
          key: 'bg',
          allowed: ['f'],
        },
      ])
    })

    it('preserves multiple variables within a token', () => {
      const result = assembleTokenData(
        createGroup({
          tokens: [
            createToken({
              vars: [
                // eslint-disable-next-line unicorn/max-nested-calls
                createVariable({
                  key: 'bg',
                  name: 'background',
                  effectiveAllowed: ['f'],
                }),
                // eslint-disable-next-line unicorn/max-nested-calls
                createVariable({
                  key: 'radius',
                  name: 'border-radius',
                  effectiveAllowed: ['p', 'f'],
                }),
              ],
            }),
          ],
        }),
      )

      expect(result.tokens[0]?.variables).toEqual([
        {
          name: 'background',
          key: 'bg',
          allowed: ['f'],
        },
        {
          name: 'border-radius',
          key: 'radius',
          allowed: ['p', 'f'],
        },
      ])
    })

    it('returns an empty token list when the group has no tokens', () => {
      const result = assembleTokenData(
        createGroup({
          tokens: [],
        }),
      )

      expect(result.tokens).toEqual([])
    })
  })
})