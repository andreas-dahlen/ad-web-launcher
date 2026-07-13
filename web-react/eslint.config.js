import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import unicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from 'eslint/config'
import noTestOnlyApi from './eslint/rules/no-test-only-api.js'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '**/*.css', '**/*.svg']),

  {
    plugins: {
      boundaries,
      unicorn,
      local: {
        rules: {
          'no-test-only-api': noTestOnlyApi,
        }
      }
    }
  },
  // ----------------------------------
  // Base TS / React config
  // ----------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],


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
      // Required so eslint-plugin-boundaries resolves TS extensionless imports
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
      },

      'boundaries/elements': [
        { type: 'api', pattern: 'src/api/**/*' },
        { type: 'app', pattern: 'src/app/*/**', capture: ['mod'] },
        { type: 'blocks', pattern: 'src/blocks/**/*' },
        { type: 'composites', pattern: 'src/composites/*/**', capture: ['mod'] },
        { type: 'config', pattern: 'src/config/**/*' },
        { type: 'data', pattern: 'src/data/*/**', capture: ['mod'] },
        { type: 'features', pattern: 'src/features/**/*' },
        { type: 'interaction', pattern: 'src/interaction/*/**', capture: ['mod'] },
        { type: 'panels', pattern: 'src/panels/*/**', capture: ['mod'] },
        { type: 'primitives', pattern: 'src/primitives/*/**', capture: ['mod'] },
        { type: 'shared', pattern: 'src/shared/**/*' },
        { type: 'styleSystem', pattern: 'src/styleSystem/*/**', capture: ['mod'] },
      ],
      'boundaries/files': [

        { pattern: '**/*.boundary.ts', category: 'boundary' },

        { pattern: 'src/app/*.{ts,tsx}', category: "app-entry" },

        { pattern: '**/*.vars.ts', category: 'vars' },
        { pattern: '**/*.store.ts', category: 'stores' },
        { pattern: '**/*.types.ts', category: 'types' },
        { pattern: '**/buildDesc.ts', category: 'buildDesc' },
        { pattern: '**/pipeline.ts', category: 'pipeline' },
        { pattern: '**/solverRouter.ts', category: 'solverRouter' },
        { pattern: '**/tokens.module.css', category: 'globalModule' }
      ],
      "boundaries/debug": {
        enabled: true,
        messages: {
          files: true,
          dependencies: false,
          violations: true,
        },
        filter: {
          // {elements: {type: "??"}, captured: "??"},
          files: [
            {
              file: {
                categories: "boundary"
              }
            }
          ]
        }
      },

      'boundaries/ignore': [
        '**/src/test/**/*',
        '**/src/assets/**/*',
        // Boundary regression fixtures
        '**/src/**/*.boundary.ts'
        // '**/src/blocks/**/block.boundary.ts',
      ],

    },

    rules: {
      // 'boundaries/no-unknown-dependencies': ['error'],
      'local/no-test-only-api': 'error',

      'boundaries/dependencies': ['error',
        {
          default: 'disallow',
          // ----------------------------------
          // BASE
          // ----------------------------------

          policies: [
            {
              from: { element: { type: "*" } },
              allow: {
                to: [
                  // { element: { type: '{{from.element.type}}' } },
                  { element: { type: 'shared' } },
                  { element: { type: 'config' } },
                  { element: { type: 'api' } },
                  { module: { origin: 'external' } }
                ]
              }
            },
            // ----------------------------------
            // APP
            // ----------------------------------

            {
              from: { element: { type: "app", captured: { mod: "*" } } },
              allow: {
                to: { element: { type: "panels" } }
              }
            },
            {
              from: { element: { type: "app", captured: { mod: "layers" } } },
              allow: {
                to: [
                  { element: { type: "app", captured: { mod: "scenes" } } },
                  { element: { type: "primitives", captured: { mod: "Carousel" } } }
                ]
              }
            },
            {
              from: { file: { categories: "app-entry" } },
              allow: {
                to: [
                  { element: { type: "shared" } },
                  { element: { type: "config" } },
                  { element: { type: "data" } },
                  { element: { type: "api" } },
                  { element: { type: "app", captured: { mod: "layers" } } },
                  { element: { type: "app", captured: { mod: "infrastructure" } } },
                  { file: { categories: "app-entry" } }
                ]
              }
            },
            // ----------------------------------
            // BLOCKS
            // ----------------------------------
            {
              from: { element: { type: "blocks" } },
              allow: {
                to: [
                  { element: { type: "composites", captured: { mod: "types" } } },
                  { element: { type: "styleSystem", captured: { mod: "schema" } } }
                ]
              }
            },


            // ----------------------------------
            // COMPOSITES
            // ----------------------------------
            {
              from: { element: { type: "composites", captured: { mod: "*" } } },
              allow: {
                to: [
                  {
                    element: { type: "composites", captured: { mod: "{{from.element.captured.mod}}" } },
                    file: { categories: "vars" }
                  },
                  { element: { type: "composites", captured: { mod: "types" } } },
                  { element: { type: "composites", captured: { mod: "hooks" } } },
                  { element: { type: "primitives", captured: { mod: "*" } } },
                  { element: { type: "blocks" } },
                  { element: { type: "data", captured: { mod: "generators" } } },
                  { element: { type: "styleSystem", captured: { mod: "schema" } } }
                ]
              }
            },

            // ----------------------------------
            // DATA
            // ----------------------------------
            {
              from: { element: { type: "data", captured: { mod: "external" } } },
              allow: {
                to: { element: { type: "data", captured: { mod: "icons" } } }
              }
            },

            // ----------------------------------
            // INTERACTION
            // ----------------------------------
            {
              from: { element: { type: "interaction", captured: { mod: "*" } } },
              allow: {
                to: [{ element: { type: "interaction", captured: { mod: "types" } } }]
              }
            },

            {
              from: { element: { type: "interaction", captured: { mod: "solvers" } } },
              allow: {
                to: { element: { type: "interaction", captured: { mod: "{{from.element.captured.mod}}" } } }
              }
            },

            {
              from: { element: { type: "interaction", captured: { mod: "adapter" } } },
              allow: { to: { file: { categories: "pipeline" } } }
            },

            {
              from: { file: { categories: "buildDesc" } },
              allow: { to: { element: { type: "primitives" } } }
            },
            {
              from: { file: { categories: "solverRouter" } },
              allow: { to: { element: { type: "interaction", captured: { mod: "solvers" } } } }
            },
            {
              from: {
                element: { type: "interaction", captured: { mod: "runtime" } },
                file: { categories: "pipeline" }
              },
              allow: {
                to: [
                  { element: { type: "interaction", captured: { mod: "input" } } },
                  { element: { type: "interaction", captured: { mod: "updater" } } },
                  { element: { type: "interaction", captured: { mod: "adapter" } } },
                  { element: { type: "primitives" } }
                ]
              }
            },
            // ----------------------------------
            // PANELS
            // ----------------------------------
            {
              from: { element: { type: "panels", captured: { mod: "*" } } },
              allow: {
                to: [
                  { element: { type: "panels", captured: { mod: "{{from.element.captured.mod}}" } } },
                  { element: { type: "composites" } },
                  { element: { type: "blocks" } },
                  { element: { type: "data", captured: { mod: "icons" } } },
                  { element: { type: "data", captured: { mod: "generators" } } }
                ]
              }
            },
            // ----------------------------------
            // PRIMITIVES
            // ----------------------------------
            {
              from: { element: { type: "primitives", captured: { mod: "*" } } },
              allow: {
                to: [
                  { element: { type: "primitives", captured: { mod: "{{from.element.captured.mod}}" } } },
                  { element: { type: "primitives", captured: { mod: "types" } } },
                  {
                    element: { type: "interaction", captured: { mod: "types" } },
                    file: { categories: "types" }
                  },
                  { element: { type: "interaction", captured: { mod: "adapter" } } },
                  {
                    element: { type: "composites", captured: { mod: "{{from.element.captured.mod}}" } },
                    file: { categories: "vars" }
                  },
                  { element: { type: "composites", captured: { mod: "styleVars" } } },
                  { element: { type: "styleSystem", file: { categories: "globalModule" } } }
                ]
              }
            },

            // ----------------------------------
            // SHARED
            // ----------------------------------
            {
              from: { element: { type: "shared" } },
              allow: {
                to: { file: { categories: "types" } }
              }
            },
            // ----------------------------------
            // STYLESYSTEM
            // ----------------------------------
            {
              from: { element: { type: "styleSystem", captured: { mod: "schema" } } },
              allow: {
                to: { element: { type: "styleSystem", captured: { mod: "tokens" } } }
              }
            },


            // ----------------------------------
            // FILES
            // ----------------------------------

            {
              from: { file: { categories: "stores" } },
              allow: {
                to: { element: { type: "data", captured: { mod: "generators" } } }
              }
            },
            {
              from: { file: { categories: "types" } },
              allow: {
                to: [
                  { element: { captured: { mod: "{{from.element.captured.mod}}" } } },
                  { file: { categories: "types" } },
                  { file: { categories: "vars" } }
                ]
              }
            }

          ]
        }
      ],
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
      'unicorn/filename-case': 'off',


      'unicorn/prefer-module': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-export-from': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prefer-switch': 'off',
      'unicorn/prefer-object-from-entries': 'off',
      'unicorn/prefer-string-replace-all': 'off',

    }
  },

  // MIGRATED: "rules" → "policies
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
    files: ['**/*.tsx', '**/*.jsx', '**/*.module.css', '**/*.svg'],
    ignores: [
      '**/vite.config.*',
      '**/vite.*.ts',
      '**/scripts/**/*',
      '**/dist/**/*',
      '**/node_modules/**/*',
      '**/.*',
      '!src/**/*'
    ],
    rules: {
      'unicorn/filename-case': ['error', {
        case: 'pascalCase',
        ignore: [
          '^src$',
          '^node_modules$'
        ]
      }]
    }
  },

  // 3. STRICT RULE: Standard TypeScript/JavaScript logic files MUST be camelCase
  {
    files: ['*/**.ts', '*/**.js'],
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
    rules: {
      'unicorn/filename-case': ['error', {
        case: 'camelCase',
      }]
    }
  }
])