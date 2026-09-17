import * as jsoncParser from 'jsonc-eslint-parser'
import custom from './tokens-custom-plugin/no-invalid-prefix-reloations-plugin.ts'
import type { Linter } from 'eslint'

export const local: Linter.Config[] = [
  {
    files: ["**/styleTokens/tokens/**/*.{json,jsonc}"],
    languageOptions: {
      parser: jsoncParser
    },
    plugins: {
      tokens: custom
    },
    rules: {
      "tokens/no-invalid-prefix-relations": "error"
    }
  }
]