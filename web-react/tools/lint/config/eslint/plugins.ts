import type { Linter } from 'eslint'

import boundaries from 'eslint-plugin-boundaries'
import unicorn from 'eslint-plugin-unicorn'
import jsonSchemaValidator from 'eslint-plugin-json-schema-validator'

export const plugins: Linter.Config = {
  plugins: {
    boundaries,
    unicorn,
    jsonSchemaValidator
  }
}