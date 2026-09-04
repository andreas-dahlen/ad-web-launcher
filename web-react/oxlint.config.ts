import { defineConfig } from 'oxlint'

import { boundarySettings } from './tools/lint/config/boundaries/settings.ts'
import { appBoundaries, compilerBoundaries } from './tools/lint/config/boundaries/wrappers/oxlint.ts'
import { ignores } from './tools/lint/config/globalIgnores.ts'
import { unusedVars } from './tools/lint/config/oxlint/unusedVars.ts'
// import { jsPlugins } from './tools/lint/config/oxlint/plugins.ts'
// import { jsPlugins } from './tools/lint/custom/index.ts'
export default defineConfig({
  ignorePatterns: ignores,

  // jsPlugins,
  settings: {
    custom: {
      rootDir: 'web-react',
    },
  },

  jsPlugins: [
    {
      name: 'internal-imports',
      specifier: './tools/lint/custom/internalImports/no-internal-import-extensions-plugin.ts',
    },

    {
      name: 'test-api',
      specifier: './tools/lint/custom/testApi-ox/no-test-only-api-plugin.ts',
    },
  ],

  // {
  //   name: 'test',
  //   specifier: './tools/lint/custom/test-plugin.js'
  // }
  //   {
  //     name: 'custom',
  //     specifier: './tools/lint/custom/index.ts'

  //   }

  // ],

  // settings: boundarySettings,

  // overrides: [
  //   appBoundaries,
  //   compilerBoundaries,
  //   unusedVars,

  // ],

  plugins: [
    'eslint',
    'typescript',
    'unicorn',
    'oxc',
    'react',
    'import'
  ],

  rules: {
    // 'test/test-rule': 'error',
    'test-api/no-test-only-api': 'error',
    'internal-imports/no-internal-import-extensions': 'error',
    'react/static-components': 'error',
    'react/use-memo': 'error',
    'react/preserve-manual-memoization': 'error',
    'react/incompatible-library': 'error',
    'react/immutability': 'error',
    'react/globals': 'error',
    'react/refs': 'error',
    'react/set-state-in-effect': 'error',
    'react/error-boundaries': 'error',
    'react/purity': 'error',
    'react/set-state-in-render': 'error',

    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        jsx: 'never',
        ignorePackages: true,
        checkTypeImports: true,
        pathGroupOverrides: [
          {
            pattern: '@interaction/**',
            action: 'enforce',
          },
          {
            pattern: '@composites/**',
            action: 'enforce',
          },
          {
            pattern: '@data/**',
            action: 'enforce',
          },

        ],
      }
    ]
  }
})
