import { defineConfig, globalIgnores } from 'eslint/config'
import base from './tools/eslint/config/base'
import boundariesRules from './tools/eslint/config/boundaries.rules'
import boundariesConfig from './tools/eslint/config/boundaries.config'
import json from './tools/eslint/config/json'
import local from './tools/eslint/config/local'
import plugins from './tools/eslint/config/plugins'
import typescript from './tools/eslint/config/typescript'
import unicorn from './tools/eslint/config/unicorn'

export default defineConfig([
  globalIgnores(['**/dist/**', '**/node_modules/**', '**/*.css', '**/*.svg', '**/*.generated.ts', '**/coverage/**']),
  base,
  boundariesConfig,
  plugins,
  typescript,
  boundariesRules,
  ...json,
  ...local,
  ...unicorn
])
