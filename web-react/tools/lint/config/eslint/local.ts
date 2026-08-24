import * as jsoncParser from 'jsonc-eslint-parser'
import localRules from '../../index'
import type { Linter } from 'eslint'

export const local: Linter.Config[] = [
  {
    files: ['**/src/**/*.{ts,tsx}'],
    rules: {
      // 'boundaries/no-unknown-dependencies': ['error'],
      'local/no-test-only-api': 'error',
    }
  },
  {
    files: ["**/styleTokens/tokens/**/*.{json,jsonc}"],
    languageOptions: {
      parser: jsoncParser
    },
    plugins: {
      tokens: localRules
    },
    rules: {
      "tokens/no-invalid-prefix-relations": "error"
    }
  }
]