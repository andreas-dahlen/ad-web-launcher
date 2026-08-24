import { defineConfig } from 'oxlint'

import { boundarySettings } from './tools/lint/config/boundaries/settings.ts'
import { appBoundaries } from './tools/lint/config/boundaries/wrappers/app-oxlint.ts'
import { ignores } from './tools/lint/config/globalIgnores.ts'
import { unusedVars } from './tools/lint/config/oxlint/unusedVars.ts'

export default defineConfig({
  ignorePatterns: ignores,
  jsPlugins: [
    {
      name: 'boundaries',
      specifier: 'eslint-plugin-boundaries',
    }
  ],

  settings: boundarySettings,

  overrides: [
    appBoundaries,
    unusedVars,

  ],

  // plugins: ['react'],
  // rules: {
  //   'react/static-components': 'error',
  //   'react/use-memo': 'error',
  //   'react/preserve-manual-memoization': 'error',
  //   'react/incompatible-library': 'error',
  //   'react/immutability': 'error',
  //   'react/globals': 'error',
  //   'react/refs': 'error',
  //   'react/set-state-in-effect': 'error',
  //   'react/error-boundaries': 'error',
  //   'react/purity': 'error',
  //   'react/set-state-in-render': 'error',
  // },

})
