import { defineConfig, globalIgnores } from 'eslint/config'
import { ignores } from './tools/lint/config/globalIgnores'
import base from './tools/lint/config/eslint/base'
import { boundarySettings } from './tools/lint/config/boundaries/settings'
import { appBoundaries, compilerBoundaries } from './tools/lint/config/boundaries/wrappers/eslint'
import { json } from './tools/lint/config/eslint/json'
import { local } from './tools/lint/config/eslint/local'
import { plugins } from './tools/lint/config/eslint/plugins'
// import { unusedVars } from './tools/lint/config/eslint/unusedVars'
import { unicorn } from './tools/lint/config/eslint/unicorn'
import oxlint from 'eslint-plugin-oxlint'


export default defineConfig([
  globalIgnores(ignores),

  {
    settings: boundarySettings
  },
  appBoundaries,
  compilerBoundaries,

  base,
  plugins,
  ...json,
  local,
  ...unicorn,
  ...oxlint.configs['flat/recommended']
])
