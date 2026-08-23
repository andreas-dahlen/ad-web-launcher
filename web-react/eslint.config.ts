import { defineConfig, globalIgnores } from 'eslint/config'
import base from './tools/eslint/config/base'
import appRules from './tools/eslint/config/boundaries/app.rules'
import appConfig from './tools/eslint/config/boundaries/app.config'
import compilerConfig from './tools/eslint/config/boundaries/tokenCompiler.config'
import compilerRules from './tools/eslint/config/boundaries/tokenCompiler.rules'
import json from './tools/eslint/config/json'
import local from './tools/eslint/config/local'
import plugins from './tools/eslint/config/plugins'
import typescript from './tools/eslint/config/typescript'
import unicorn from './tools/eslint/config/unicorn'

export default defineConfig([
  globalIgnores(['**/dist/**', '**/node_modules/**', '**/*.css', '**/*.svg', '**/*.generated.ts', '**/coverage/**']),
  base,
  appConfig,
  appRules,
  plugins,
  typescript,
  compilerConfig,
  compilerRules,
  ...json,
  ...local,
  ...unicorn
])
