import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import unicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/**/*.{ts,tsx}'],

    plugins: {
      boundaries,
      unicorn
    },

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      unicorn.configs.recommended
    ],

    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },

    settings: {
      'boundaries/elements': [

        { type: 'api', pattern: '**/src/api/**' },

        { type: 'app', pattern: '**/src/app/**/*' },
        { type: 'app-layers', pattern: '**/src/app/layers/**' },
        { type: 'app-scenes', pattern: '**/src/app/scenes/**' },
        { type: 'app-infrastructure', pattern: '**/src/app/infrastructure/**' },

        { type: 'blocks', pattern: '**/src/blocks/**' },

        { type: 'composites-internal', pattern: '**/src/composites/internals/**' },
        { type: 'composites', pattern: '**/src/composites/**' },

        { type: 'config', pattern: '**/src/config/**/*' },

        { type: 'data', pattern: '**/src/data/**/*' },

        { type: 'features', pattern: '**/src/features/**/*' },

        { type: 'interaction-interpreter', pattern: '**/src/interaction/input/interpreter.*' },
        { type: 'interaction-buildDesc', pattern: '**/src/interaction/input/buildDesc.*' },
        { type: 'interaction-pipeline', pattern: '**/src/interaction/runtime/pipeline.*' },
        { type: 'interaction-solver-router', pattern: '**/src/interaction/runtime/solverRouter.*' },
        { type: 'interaction-solvers-utils', pattern: '**/src/interaction/solvers/utils/**' },
        { type: 'interaction-types', pattern: '**/src/interaction/types/**' },
        { type: 'interaction-input', pattern: '**/src/interaction/input/**' },
        // { type: 'interaction-runtime', pattern: '**/src/interaction/runtime/**' },
        { type: 'interaction-solvers', pattern: '**/src/interaction/solvers/**' },
        { type: 'interaction-updater', pattern: '**/src/interaction/updater/**' },
        // { type: 'interaction', pattern: '**/src/interaction/**' },

        { type: 'panels', pattern: '**/src/panels/**/*' },

        { type: 'primitives-store', pattern: '**/src/primitives/store/**' },
        { type: 'primitives', pattern: '**/src/primitives/**' },

        { type: 'shared', pattern: '**/src/shared/**/*' },

        { type: 'style-system-compiler', pattern: '**/src/styleSystem/compiler/**/*' },
        { type: 'style-system-schema', pattern: '**/src/styleSystem/schema/**/*' },
        { type: 'style-system-tokens', pattern: '**/src/styleSystem/tokens/**/*' },

        //assets is ignored
        //styleSystem only has internal rules :S
        //test is ignored
      ],


      'boundaries/ignore': [
        '**/src/test/**/*',
        '**/src/assets/**/*'
      ]
    },



    rules: {

      'unicorn/no-unused-properties': 'warn',
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/no-computed-property-existence-check': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-break-in-nested-loop': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/no-for-each': 'off',
      'unicorn/prefer-minimal-ternary': 'off',
      'unicorn/empty-brace-spaces': 'off',
      'unicorn/no-this-outside-of-class': 'off',


      'unicorn/prefer-module': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-export-from': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prefer-switch': 'off',
      'unicorn/prefer-object-from-entries': 'off',
      'unicorn/prefer-string-replace-all': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'boundaries/dependencies': ['error', {
        default: 'disallow',

        // MIGRATED: "rules" → "policies"
        policies: [

          // ─── STRICT OVERRIDES ───────────────────────────────
          {
            from: [{ element: { type: 'blocks' } }],
            disallow: [
              { element: { type: 'blocks' } },
              { element: { type: 'style-system-schema' } }
            ]
          },
          {
            from: [{ element: { type: 'composites' } }],
            disallow: [{ element: { type: 'composites' } }]
          },
          {
            from: [{ element: { type: 'interaction-solvers' } }],
            disallow: [{ element: { type: 'interaction-solvers' } }]
          },
          {
            from: [{ element: { type: 'panels' } }],
            disallow: [{ element: { type: 'panels' } }]
          },
          {
            from: [{ element: { type: 'primitives' } }],
            disallow: [{ element: { type: 'primitives' } }]
          },

          // ─── STYLE SYSTEM  ───────────────────────────────────
          {
            from: [{ element: { type: 'style-system-tokens' } }],
            disallow: [
              { element: { type: '*' } },
              { element: { type: 'blocks' } },
              { element: { type: 'composites' } },
              { element: { type: 'panels' } },
              { element: { type: 'app' } },
              { element: { type: 'style-system-schema' } }, // except explicit allow below
              { element: { type: 'style-system-compiler' } }
            ]
          },

          {
            from: [{ element: { type: 'style-system-schema' } }],
            disallow: [
              { element: { type: '*' } },
              { element: { type: 'blocks' } },
              { element: { type: 'composites' } },
              { element: { type: 'panels' } },
              { element: { type: 'app' } }
            ]
          },

          {
            from: [{ element: { type: 'style-system-compiler' } }],
            disallow: [
              { element: { type: '*' } },
              { element: { type: 'blocks' } },
              { element: { type: 'composites' } },
              { element: { type: 'panels' } },
              { element: { type: 'app' } }
            ]
          },

          // ─── APP LAYERS ───────────────────────────────────────
          {
            from: [{ element: { type: 'app-layers' } }],
            allow: [
              { element: { type: 'panels' } }
            ]
          },
          {
            from: [{ element: { type: 'app' } }],
            allow: [
              { element: { type: 'app-layers' } },
              { element: { type: 'app-infrastructure' } }
            ]
          },

          // ─── BLOCKS ───────────────────────────────────────          
          // {
          //   from: [{ element: { type: 'blocks' } }],
          //   allow: [
          //   ]
          // },

          // ─── INTERACTION ENGINE ──────────────────────────────
          {
            from: [{ element: { type: 'interaction-interpreter' } }],
            allow: [
              { element: { type: 'interaction-input' } }
            ]
          },
          {
            from: [{ element: { type: 'interaction-buildDesc' } }],
            allow: [
              { element: { type: 'interaction-input' } }
            ]
          },
          {
            from: [{ element: { type: 'interaction-pipeline' } }],
            allow: [
              { element: { type: 'interaction-updater' } },
              { element: { type: 'interaction-interpreter' } },
              { element: { type: 'interaction-input' } },
            ]
          },
          {
            from: [{ element: { type: 'interaction-input' } }],
            allow: [
              { element: { type: 'interaction-buildDesc' } },
              { element: { type: 'interaction-types' } }
            ]
          },
          {
            from: [{ element: { type: 'interaction-solvers' } }],
            allow: [
              { element: { type: 'interaction-solvers-utils' } },
              { element: { type: 'interaction-types' } }
            ]
          },
          // {
          //   from: [{ element: { type: 'interaction' } }],
          //   allow: [
          //     { element: { type: 'interaction' } },
          //     { element: { type: 'interaction-solvers-utils' } }
          //   ]
          // },


          // ─── UI BUILDING BLOCKS ──────────────────────────────
          {
            from: [{ element: { type: 'panels' } }],
            allow: [
              { element: { type: 'composites' } },
              { element: { type: 'blocks' } }
            ]
          },

          // ─── STYLESYSTEM ──────────────────────────────
          {
            from: [{ element: { type: 'style-system-schema' } }],
            allow: [
              { element: { type: 'style-system-tokens' } }
            ]
          },

          // ─── GLOBAL DEFAULTS ─────────────────────────────────
          {
            from: [{ element: { type: '*' } }],
            allow: [
              { element: { type: '{{from.element.type}}' } },
              { element: { type: 'shared' } },
              { element: { type: 'config' } },
              { element: { type: 'data' } },
              { element: { type: 'api' } },
              { origin: 'external' }
            ]
          },

        ]
      }]
    }
  },
  // ─── Unicorn folder naming rules ──────────────────────

  {
    files: ['src/test/**/*.{ts,tsx}'],
    rules: {
      'unicorn/no-useless-spread': 'off',
      'unicorn/prefer-early-return': 'off',
      'unicorn/prefer-dom-node-append': 'off'
    }
  },


  // 2. STRICT RULE: React Components, SVGs, and CSS Modules MUST be PascalCase
  {
    files: ['**.tsx', '**.jsx', '**.module.css', '**.svg'],
    ignores: [
      '**/vite.config.*',
      '**/vite.*.ts',
      '**/scripts/**/*',
      '**/dist/**/*',
      '**/node_modules/**/*',
      '**/.*',
      '!src/**/*'
    ],
    plugins: { unicorn },
    rules: {
      'unicorn/filename-case': ['error', {
        case: 'pascalCase',
      }]
    }
  },

  // 3. STRICT RULE: Standard TypeScript/JavaScript logic files MUST be camelCase
  {
    files: ['**.ts', '**.js'],
    // Exclude component test files or files that intentionally use PascalCase if necessary
    ignores: [
      '**/*.tsx',
      '**/test/**/*',
      '**/vite.config.*',
      '**/vite.*.ts',
      '**/scripts/**/*',
      '**/dist/**/*',
      '**/node_modules/**/*',
      '**/.*',
      '!src/**/*'
    ],
    plugins: { unicorn },
    rules: {
      'unicorn/filename-case': ['error', {
        case: 'camelCase',
      }]
    }
  },



  // ─── Test-Only API & Cross-CSS Restrictions ──────────────────────

  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/*.module.css'],
              message: 'CSS Modules must be imported locally from their own folder. No cross-folder CSS imports allowed.',
              allowImportNames: ['styleSystem']
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/test/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '__TEST_ONLY_API',
              message: '__TEST_ONLY_API is for tests only'
            }
          ]
        }
      ]
    }
  }
])
//   {
//     files: ['src/**/*.{ts,tsx}'],
//     rules: {
//       'no-restricted-imports': ['error', {
//         regex: '^(?!\\.\\/).*\\.module\\.css$',
//         message: 'CSS Modules must be imported locally from their own folder. No cross-folder CSS imports allowed.'
//       }]
//     }
//   },
// ])
// {
//   files: ['src/**/*.{ts,tsx}'],
//   rules: {
//     'no-restricted-imports': ['error', {
//       group: ['**/*'],
//       importNames: ['__TEST_ONLY_API'],
//       message: "__TEST_ONLY_API is for tests only"
//     }]
//   }
//




//     files: ['src/**/*.{ts,tsx}'],
//     ignores: [
//       'src/test/**/*'
//     ],
//     rules: {
//       'no-restricted-imports': ['error',
//         // {
//         // flat-config matches schemas cleanly using direct objects array or specific group paths
//         // paths: [],
//         // patterns: 
//         [
//           {
//             regex: '^(?!\\.\\/).*\\.module\\.css$',
//             message: 'CSS Modules must be imported locally from their own folder. No cross-folder CSS imports allowed.'
//           },
//           {
//             group: ['**/*'],
//             // ignoreChoice: {
//             //   paths: ['@data/icons', 'src/data/icons/**/*']
//             // },
//             importNames: ['__TEST_ONLY_API'],
//             message: '__TEST_ONLY_API is for tests only'
//           }
//         ]
//         // }
//       ]
//     }
//   }
// ])