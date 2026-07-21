import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import unicorn from 'eslint-plugin-unicorn'
import localRules from './eslint/index.ts'
import jsonSchemaValidator from 'eslint-plugin-json-schema-validator'
import * as jsoncParser from 'jsonc-eslint-parser'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...jsonSchemaValidator.configs.base,

  globalIgnores(['dist', 'node_modules', '**/*.css', '**/*.svg']),

  {
    plugins: {
      boundaries,
      unicorn,
      jsonSchemaValidator,
      local: localRules
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
        { type: 'shared', pattern: 'src/shared/*/**', capture: ['mod'] },
        { type: 'generated', pattern: 'src/shared/generated/*/**', capture: ['mod'] },
        { type: 'styleCompiler', pattern: 'src/styleCompiler/*/**', capture: ['mod'] },
      ],
      'boundaries/files': [

        { pattern: '**/*.boundary.ts', category: 'boundary' },

        { pattern: 'src/app/*.{ts,tsx}', category: "app-entry" },

        { pattern: '**/*.store.ts', category: 'stores' },
        { pattern: '**/*.types.ts', category: 'types' },
        { pattern: '**/*.d.ts', category: 'types' },

        { pattern: '**/buildDesc.ts', category: 'buildDesc' },
        { pattern: '**/pipeline.ts', category: 'pipeline' },
        { pattern: '**/solverRouter.ts', category: 'solverRouter' },
        { pattern: '**/gesture.utils.ts', category: 'gestureUtils' }
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
                  { element: { type: 'shared', captured: { mod: "types" } }, file: { categories: "types" } },
                  { element: { type: 'shared', captured: { mod: "assertions" } } },
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
                  { element: { type: "primitives", captured: { mod: "Carousel" } } },
                ]
              }
            },
            {
              from: [
                { element: { type: "app", captured: { mod: "scenes" } } },
                { element: { type: "app", captured: { mod: "layers" } } },
                { element: { type: "app", captured: { mod: "infrastructure" } } },
              ],
              allow: { to: { element: { type: "shared", captured: { mod: "state" } } } }
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
                  // { element: { type: "styleCompiler", captured: { mod: "schema" } } },
                  { element: { type: "shared", captured: { mod: "sxCompiler" } } },
                  { element: { type: "shared", captured: { mod: "generated" } } }

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
                  { element: { type: "composites", captured: { mod: "types" } } },
                  { element: { type: "composites", captured: { mod: "hooks" } } },
                  { element: { type: "primitives", captured: { mod: "*" } } },
                  { element: { type: "blocks" } },
                  { element: { type: "data", captured: { mod: "generators" } } },
                  // { element: { type: "styleCompiler", captured: { mod: "schema" } } },
                  { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } },
                  { element: { type: "shared", captured: { mod: "generated" } } }
                ]
              }
            },
            // ----------------------------------
            // DATA
            // ----------------------------------
            {
              from: { element: { type: "data", captured: { mod: "external" } } },
              allow: { to: { element: { type: "data", captured: { mod: "icons" } } }, }
            },
            {
              from: { element: { type: "data", captured: { mod: "generators" } } },
              allow: {
                to: { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
              }
            },
            // ----------------------------------
            // FEATURES
            // ----------------------------------
            {
              from: { element: { type: "features" } },
              allow: {
                to: { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
              }
            },
            // ----------------------------------
            // INTERACTION
            // ----------------------------------
            {
              from: { element: { type: "interaction", captured: { mod: "*" } } },
              allow: {
                to: [
                  { element: { type: "interaction", captured: { mod: "types" } } },
                  { element: { type: "interaction", captured: { mod: "assertions" } } }
                ]
              }
            },

            {
              from: { element: { type: "interaction", captured: { mod: "solvers" } } },
              allow: { to: { element: { type: "interaction", captured: { mod: "{{from.element.captured.mod}}" } } } }
            },

            {
              from: { element: { type: "interaction", captured: { mod: "adapter" } } },
              allow: { to: { file: { categories: "pipeline" } } }
            },

            {
              from: { file: { categories: "buildDesc" } },
              allow: {
                to: [
                  { element: { type: "primitives" } },
                  { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
                ]
              }
            },
            {
              from: { file: { categories: "gestureUtils" } },
              allow: { to: { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } } }
            },
            {
              from: {
                element: { type: "interaction", captured: { mod: "runtime" } },
                file: { categories: "solverRouter" }
              },
              allow: { to: { element: { type: "interaction", captured: { mod: "solvers" } } }, }
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
                  { element: { type: "primitives" } },
                  { element: { type: "shared", captured: { mod: "state" } } }
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
                  { element: { type: "data", captured: { mod: "generators" } } },
                  { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } }
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
                  // { element: { type: "interaction", captured: { mod: "assertions" } } },
                  { element: { type: "composites", captured: { mod: "styleVars" } } },
                  // { element: { type: "styleCompiler", captured: { mod: "schema" } } },
                  { element: { type: "shared", captured: { mod: "sxCompiler" } } },
                  { element: { type: "shared", captured: { mod: "state" } }, file: { categories: "stores" } },
                  { element: { type: "shared", captured: { mod: "generated" } } }
                ]
              }
            },
            // ----------------------------------
            // SHARED
            // ----------------------------------
            {
              from: { element: { type: "shared", captured: { mod: "*" } } },
              allow: {
                to: [
                  { file: { categories: "types" } },
                  { element: { type: "shared", captured: { mod: "{{from.element.captured.mod}}" } } }
                ]
              }
            },
            {
              from: { element: { type: "shared", captured: { mod: "sxCompiler" } } },
              allow: { to: { element: { type: "shared", captured: { mod: "compilerUtils" } } } }
            },
            // ----------------------------------
            // shared/generated
            // ----------------------------------
            {
              from: { element: { type: "shared", element: { type: "generated", captured: { mod: "presets" } } } },
              allow: {
                to: [
                  { element: { type: "blocks" } },
                  { element: { type: "primitives" } },
                ]
              }
            },
            {
              from: { element: { type: "shared", element: { type: "generated", captured: { mod: "components" } } } },
              allow: {
                to: [
                  { element: { type: "styleCompiler", captured: { mod: "tokens" } } },
                  { element: { type: "styleCompiler", captured: { mod: "schema" } } }
                ]
              }
            },
            // ----------------------------------
            // STYLECOMPILER
            // ----------------------------------
            {
              from: { element: { type: "styleCompiler", captured: { mod: "schema" } } },
              allow: {
                to: [
                  { element: { type: "styleCompiler", captured: { mod: "tokens" } } },
                  { element: { type: "shared", captured: { mod: "compilerUtils" } } }
                ]
              }
            },
            {
              from: { element: { type: "styleCompiler", captured: { mod: "tokens" } } },
              allow: {
                to: [
                  { element: { type: "shared", captured: { mod: "compilerUtils" } } }
                ]
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
                  { file: { categories: "types" } }
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
      '!src/**/*',
      '**/plugins/**/*'
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
      '!src/**/*',
      '**/plugins/**/*'
    ],
    rules: {
      'unicorn/filename-case': ['error', {
        case: 'camelCase',
      }]
    }
  },
  // ──────────── Json linting ──────────────────────
  {
    files: ['src/styleCompiler/tokens/**/*.{json,jsonc}'],
    plugins: {
      'json-schema-validator': jsonSchemaValidator,
    },
    rules: {
      'json-schema-validator/no-invalid': [
        'error',
        {
          schemas: [
            {
              fileMatch: ['src/styleCompiler/tokens/**/*.{json,jsonc}'],
              schema: './src/styleCompiler/schema/token.schema.json'
            }
          ]
        }
      ]
    }
  },
  {
    files: [
      "**/styleCompiler/tokens/**/*.json",
      "**/styleCompiler/tokens/**/*.jsonc"
    ],
    languageOptions: {
      parser: jsoncParser
    },
    plugins: {
      tokens: localRules
    },
    rules: {
      "tokens/no-invalid-prefix-relations": "error"
    }
  }
])