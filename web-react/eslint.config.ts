import { defineConfig, globalIgnores } from 'eslint/config'
import { ignores } from './tools/lint/config/globalIgnores.ts'
import base from './tools/lint/config/eslint/base.ts'
import { json } from './tools/lint/config/eslint/json.ts'
import { local } from './tools/lint/config/eslint/local.ts'
import { plugins } from './tools/lint/config/eslint/plugins.ts'
import { unicorn } from './tools/lint/config/eslint/unicorn.ts'
import oxlint from 'eslint-plugin-oxlint'


export default defineConfig([
  globalIgnores(ignores),
  base,
  plugins,
  ...json,
  local,
  ...unicorn,
  ...oxlint.configs['flat/recommended']
])
