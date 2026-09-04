import { defineConfig, globalIgnores } from 'eslint/config'
import { ignores } from './tools/lint/config/globalIgnores.ts'
import base from './tools/lint/config/eslint/base.ts'
import { boundarySettings } from './tools/lint/config/boundaries/settings.ts'
import { appBoundaries, compilerBoundaries } from './tools/lint/config/boundaries/wrappers/eslint.ts'
import { json } from './tools/lint/config/eslint/json.ts'
import { local } from './tools/lint/config/eslint/local.ts'
import { plugins } from './tools/lint/config/eslint/plugins.ts'
// import { unusedVars } from './tools/lint/config/eslint/unusedVars'
import { unicorn } from './tools/lint/config/eslint/unicorn.ts'
import oxlint from 'eslint-plugin-oxlint'


export default defineConfig([
  globalIgnores(ignores),

  // {
  //   settings: boundarySettings
  // },
  // appBoundaries,
  // compilerBoundaries,

  base,
  plugins,
  ...json,
  local,
  ...unicorn,
  ...oxlint.configs['flat/recommended']
])
