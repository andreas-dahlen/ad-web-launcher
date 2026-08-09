import parser from '@typescript-eslint/parser'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import rule from '../../../../eslint/testApi/no-test-only-api'

const config = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      ecmaVersion: 'latest' as const,
      sourceType: 'module' as const
    },
    plugins: {
      testApi: {
        rules: {
          'no-test-only-api': rule
        }
      }
    },
    rules: {
      'testApi/no-test-only-api': 'error' as const
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

describe('[ESLINT] no-test-only-api', () => {
  it('allows __TEST_ONLY_API in test files', () => {
    expect(
      lint(
        `import { __TEST_ONLY_API } from './testApi'`,
        `${projectPath}/src/test/foo.test.ts`
      )
    ).toHaveLength(0)
  })

  it('reports __TEST_ONLY_API outside test files', () => {
    const messages = lint(
      `import { __TEST_ONLY_API } from './testApi'`,
      `${projectPath}/src/foo.ts`
    )

    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      message: '__TEST_ONLY_API is only available in test files',
      severity: 2
    })
  })

  it('allows unrelated imports outside test files', () => {
    expect(
      lint(
        `import { something } from './module'`,
        `${projectPath}/src/foo.ts`
      )
    ).toHaveLength(0)
  })
})