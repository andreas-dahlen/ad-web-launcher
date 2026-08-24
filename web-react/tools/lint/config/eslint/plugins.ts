import type { Linter } from 'eslint'

import boundaries from 'eslint-plugin-boundaries'
import unicorn from 'eslint-plugin-unicorn'
import jsonSchemaValidator from 'eslint-plugin-json-schema-validator'

import localRules from '../../index'

export const plugins: Linter.Config = {
  plugins: {
    boundaries,
    unicorn,
    jsonSchemaValidator,
    local: localRules,
  }
}