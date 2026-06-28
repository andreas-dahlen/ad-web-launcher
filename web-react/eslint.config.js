import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/**/*.{ts,tsx}'],

    plugins: {
      boundaries
    },

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },

    settings: {
      // ELEMENTS
      'boundaries/elements': [
        // App Architecture
        { type: 'app-layers', pattern: '**/src/app/layers/**/*', mode: 'full' },
        { type: 'app-scenes', pattern: '**/src/app/scenes/**/*', mode: 'full' },
        { type: 'infrastructure', pattern: '**/src/app/infrastructure/**/*', mode: 'full' },
        { type: 'app', pattern: '**/src/app/**/*', mode: 'full' },

        // UI Modules
        { type: 'panels', pattern: '**/src/panels/**/*', mode: 'full' },
        { type: 'features', pattern: '**/src/features/**/*', mode: 'full' },
        { type: 'composites', pattern: '**/src/composites/**/*', mode: 'full' },
        { type: 'composites-internal', pattern: '**/src/composites/internals/**/*', mode: 'full' },
        { type: 'blocks', pattern: '**/src/blocks/**/*', mode: 'full' },
        { type: 'primitives', pattern: '**/src/primitives/**/*', mode: 'full' },
        { type: 'primitives-store', pattern: '**/src/primitives/store/**/*', mode: 'full' },

        // Shared & Data Infra
        { type: 'shared', pattern: '**/src/shared/**/*', mode: 'full' },
        { type: 'config', pattern: '**/src/config/**/*', mode: 'full' },
        { type: 'data', pattern: '**/src/data/**/*', mode: 'full' },
        { type: 'api', pattern: '**/src/api/**/*', mode: 'full' },

        // Interaction Engine
        { type: 'interaction-interpreter', pattern: '**/src/interaction/input/interpreter.ts', mode: 'full' },
        { type: 'interaction-buildDesc', pattern: '**/src/interaction/input/buildDesc.ts', mode: 'full' },
        { type: 'interaction-input', pattern: '**/src/interaction/input/**/*', mode: 'full' },
        { type: 'interaction-pipeline', pattern: '**/src/interaction/runtime/pipeline.ts', mode: 'full' },
        { type: 'interaction-solver-router', pattern: '**/src/interaction/runtime/solverRouter.ts', mode: 'full' },
        { type: 'interaction-runtime', pattern: '**/src/interaction/runtime/**/*', mode: 'full' },
        { type: 'interaction-solvers-utils', pattern: '**/src/interaction/solvers/utils/**/*', mode: 'full' },
        { type: 'interaction-solvers', pattern: '**/src/interaction/solvers/**/*', mode: 'full' },
        { type: 'interaction-updater', pattern: '**/src/interaction/updater/**/*', mode: 'full' },
        { type: 'interaction', pattern: '**/src/interaction/**/*', mode: 'full' },
      ],

      // IGNORE
      'boundaries/ignore': [
        '**/src/test/**/*',
        '**/src/assets/**/*',
      ],
    },

    rules: {
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
        rules: [
          // ─── STRICT OVERRIDES (Exceptions to the rule) ─────────────────
          { from: [{ type: 'panels' }], disallow: [{ to: { type: 'panels' } }] },
          { from: [{ type: 'primitives' }], disallow: [{ to: { type: 'primitives' } }] },
          { from: [{ type: 'blocks' }], disallow: [{ to: { type: 'blocks' } }] },
          { from: [{ type: 'composites' }], disallow: [{ to: { type: 'composites' } }] },
          { from: [{ type: 'interaction-solvers' }], disallow: [{ to: { type: 'interaction-solvers' } }] },

          // ─── Global & Shared Defaults ─────────────────────────────────
          {
            from: [{ type: '*' }],
            allow: [
              { to: { type: '{{from.type}}' } }, // Fixed template warning
              { to: { type: 'shared' } },
              { to: { type: 'config' } },
              { to: { type: 'data' } },
              { to: { type: 'api' } },
              { to: { origin: 'external' } },
            ]
          },

          // ─── Interaction Engine Boundaries ───────────────────────────
          {
            // Solves 'interaction-solvers', 'interaction-input', etc., looking up to root level shared files (e.g., interaction/types.ts)
            from: [{ type: 'interaction*' }],
            allow: [
              { to: { type: 'interaction' } },
              { to: { type: 'interaction-solvers-utils' } }
            ]
          },
          {
            from: [{ type: 'interaction-input' }],
            allow: [
              { to: { type: 'interaction-buildDesc' } }
            ]
          },
          {
            from: [{ type: 'interaction-buildDesc' }],
            allow: [
              { to: { type: 'interaction-input' } },
            ]
          },
          {
            from: [{ type: 'interaction-interpreter' }],
            allow: [
              { to: { type: 'interaction-input' } },
            ]
          },
          {
            from: [{ type: 'interaction-pipeline' }],
            allow: [
              { to: { type: 'interaction-updater' } },
              { to: { type: 'interaction-interpreter' } },
            ]
          },

          // ─── App Layer Rules ──────────────────────────────────────────
          {
            from: [{ type: 'app' }],
            allow: [
              { to: { type: 'app-layers' } },
              { to: { type: 'infrastructure' } } // Clears App.tsx/main.tsx loading core infra setups
            ]
          },
          {
            from: [{ type: 'app-layers' }],
            allow: [
              { to: { type: 'panels' } },
            ]
          },

          // ─── UI Building Blocks & Panels ──────────────────────────────
          {
            from: [{ type: 'panels' }],
            allow: [
              { to: { type: 'composites' } },
              { to: { type: 'blocks' } },
            ]
          },
          // {
          //   from: [{ type: 'features' }],
          //   allow: [
          //     { to: { type: 'blocks' } },
          //     { to: { type: 'infrastructure' } },
          //   ]
          // },
          // {
          //   from: [{ type: 'composites' }],
          //   allow: [
          //     { to: { type: 'primitives' } },
          //     { to: { type: 'infrastructure' } },
          //     { to: { type: 'composites-internal' } },
          //   ]
          // },
        ]
      }]
    }
  },
  // ─── Test-Only API & Cross-CSS Restrictions ──────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/test/**/*'],
    rules: {
      'no-restricted-imports': ['error', {
        // flat-config matches schemas cleanly using direct objects array or specific group paths
        // paths: [],
        patterns: [
          {
            regex: '^(?!\\.\\/).*\\.module\\.css$',
            message: 'CSS Modules must be imported locally from their own folder. No cross-folder CSS imports allowed.'
          },
          {
            group: ['**/*'],
            importNames: ['__TEST_ONLY_API'],
            message: '__TEST_ONLY_API is for tests only'
          }
        ]
      }]
    }
  }
])