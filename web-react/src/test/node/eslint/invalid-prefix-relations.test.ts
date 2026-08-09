import * as jsoncParser from 'jsonc-eslint-parser'
import parser from '@typescript-eslint/parser'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import rule from '../../../../eslint/tokens/no-invalid-prefixes-relations'

const config = [
  {
    files: ['**/*.json', '**/*.jsonc'],
    languageOptions: {
      parser: jsoncParser,
      ecmaVersion: 'latest' as const,
      sourceType: 'module' as const
    },
    plugins: {
      tokenValidation: {
        rules: {
          'validate-token-prefixes': rule
        }
      }
    },
    rules: {
      'tokenValidation/validate-token-prefixes': 'error' as const
    }
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser
    }
  }
]

const lint = (code: string, filename: string) => {
  const linter = new Linter()

  return linter.verify(
    code,
    config,
    { filename }
  )
}

const projectPath = process.cwd()

const file = (name: string) =>
  `${projectPath}/src/tokens/${name}`

describe('[ESLINT] validate-token-prefixes', () => {
  it('allows a valid token configuration', () => {
    const messages = lint(
      `{
        "alwaysAllowed": ["f", "t"],
        "vars": {
          "buttonColor": {
            "allowed": ["s", "m"],
            "exclude": ["f"],
            "values": {
              "s": "someValue",
              "m": "someValue"
            }
          }
        }
      }`,
      file('tokens.json')
    )

    expect(messages).toHaveLength(0)
  })

  it('reports variables that are not camelCase', () => {
    const messages = lint(
      `{
        "vars": {
          "ButtonColor": {
            "values": {}
          }
        }
      }`,
      file('tokens.json')
    )

    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      message: '"ButtonColor" must be camelCase',
      severity: 2
    })
  })

  it('reports allowed prefixes that are already alwaysAllowed', () => {
    const messages = lint(
      `{
        "alwaysAllowed": ["f"],
        "vars": {
          "buttonColor": {
            "allowed": ["f"],
            "values": {}
          }
        }
      }`,
      file('tokens.json')
    )

    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      message: '"f" is already part of alwaysAllowed',
      severity: 2
    })
  })

  it('reports excluded prefixes that are not alwaysAllowed', () => {
    const messages = lint(
      `{
        "alwaysAllowed": ["f"],
        "vars": {
          "buttonColor": {
            "exclude": ["s"],
            "values": {}
          }
        }
      }`,
      file('tokens.json')
    )

    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      message: '"s" cannot be excluded because it is not alwaysAllowed',
      severity: 2
    })
  })

  it('reports prefixes that exist in both allowed and exclude', () => {
    const messages = lint(
      `{
        "alwaysAllowed": ["f"],
        "vars": {
          "buttonColor": {
            "allowed": ["f"],
            "exclude": ["f"],
            "values": {}
          }
        }
      }`,
      file('tokens.json')
    )

    expect(messages).toHaveLength(2)

    expect(
      messages.some(
        message =>
          message.message ===
          '"f" is already part of alwaysAllowed'
      )
    ).toBe(true)

    expect(
      messages.some(
        message =>
          message.message ===
          '"f" cannot exist in both allowed and exclude'
      )
    ).toBe(true)
  })

  it('reports values using an undeclared prefix', () => {
    const messages = lint(
      `{
        "alwaysAllowed": ["f"],
        "vars": {
          "buttonColor": {
            "allowed": ["s"],
            "values": {
              "m": "someValue"
            }
          }
        }
      }`,
      file('tokens.json')
    )

    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      message: '"m" is not declared as allowed or alwaysAllowed',
      severity: 2
    })
  })

  it('reports values using an excluded prefix', () => {
    const messages = lint(
      `{
        "alwaysAllowed": ["f"],
        "vars": {
          "buttonColor": {
            "allowed": ["s"],
            "exclude": ["f"],
            "values": {
              "f": "someValue"
            }
          }
        }
      }`,
      file('tokens.json')
    )

    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      message: '"f" cannot be used because it is excluded',
      severity: 2
    })
  })

  it('reports values that reference themselves', () => {
    const messages = lint(
      `{
        "alwaysAllowed": ["f"],
        "vars": {
          "buttonColor": {
            "allowed": ["s"],
            "values": {
              "s": "s"
            }
          }
        }
      }`,
      file('tokens.json')
    )

    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      message: '"s" cannot reference itself',
      severity: 2
    })
  })

  it('supports JSONC files', () => {
    const messages = lint(
      `{
        // token configuration
        "alwaysAllowed": ["f"],
        "vars": {
          "buttonColor": {
            "allowed": ["s"],
            "values": {
              "s": "someValue"
            }
          }
        }
      }`,
      file('tokens.jsonc')
    )

    expect(messages).toHaveLength(0)
  })

  it('ignores non-JSON files', () => {
    const messages = lint(
      `const ButtonColor = {};`,
      `${projectPath}/src/tokens/example.ts`
    )

    expect(messages).toHaveLength(0)
  })
})