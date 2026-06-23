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




    //design API:::

    //current ignore list..         
    // "src/App.tsx",
    // "src/main.tsx",
    // "src/api/**/*",
    // "src/test/**/*",
    // "src/assets/**/*",
    // "src/test/**/*"

    //* (all): data, config, shared 

    //data: ignore OR app-scenes
    //config: ignore
    //shared: TODO needs expansion! but yeah itself and everyone can use...

    //app-compositions none! except for the *

    // App-root: layers*, external
    //app-scenes: (NOT from itself) primitives, composites, features, external
    //app-layers: (itself but only needs module), composition, primitives, features, external

    //interaction-core: itself, and pipeline
    //interaction-pipeline.tsx or interaction-pipeline: needs everything from interaction.. "NOT itself" also needs primitives-zustandStores
    //interaction-solvers: itself, or more explicitly every child folder uses only itself... and pipeline. and utils inside of solvers/utils.
    //interaction-updater: needs only pipeline

    //composites:(maybe itself? but lets go with NOT) primitives, infrastructure

    //all primitives-child (each:): (itself only) and external

    //feature- all children (each:): (only itself), primitives, infrastructure,

    //infrastructure: NOTHING except external..



    //


    settings: {
      // ELEMENTS
      'boundaries/elements': [
        // app
        { type: 'app-compositions', pattern: '**/src/app/compositions/**/*', mode: 'full' },
        { type: 'app-root', pattern: '**/src/app/Root.tsx', mode: 'full' },
        { type: 'app-layers', pattern: '**/src/app/layers/**/*', mode: 'full' },
        { type: 'app-scenes', pattern: '**/src/app/scenes/**/*', mode: 'full' },
        { type: 'app', pattern: '**/src/app/**/*', mode: 'full' },

        // ui
        { type: 'features', pattern: '**/src/features/**/*', mode: 'full' },
        { type: 'composites', pattern: '**/src/composites/**/*', mode: 'full' },
        { type: 'primitives', pattern: '**/src/primitives/**/*', mode: 'full' },
        { type: 'infrastructure', pattern: '**/src/infrastructure/**/*', mode: 'full' },

        // shared infra
        { type: 'shared', pattern: '**/src/shared/**/*', mode: 'full' },
        { type: 'config', pattern: '**/src/config/**/*', mode: 'full' },
        { type: 'data', pattern: '**/src/api/**/*', mode: 'full' },

        // interaction — pipeline before core so it gets its own type
        { type: 'interaction-pipeline', pattern: '**/src/interaction/core/pipeline.ts', mode: 'full' },
        { type: 'interaction-core', pattern: '**/src/interaction/core/**/*', mode: 'full' },
        { type: 'interaction-solvers', pattern: '**/src/interaction/solvers/**/*', mode: 'full' },
        { type: 'interaction-updater', pattern: '**/src/interaction/updater/**/*', mode: 'full' },
      ],

      // IGNORE
      'boundaries/ignore': [
        '**/src/App.tsx',
        '**/src/main.tsx',
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

          // ─── implicit for everything ───────────────────────────────────
          {
            from: [{ type: '*' }],
            allow: [
              { to: { type: 'shared' } },
              { to: { type: 'config' } },
              { to: { type: 'data' } },
              { to: { origin: 'external' } },
            ]
          },

          // ─── app ───────────────────────────────────────────────────────
          {
            from: [{ type: 'app-root' }],
            allow: [
              { to: { type: 'app-layers' } },
            ]
          },
          {
            from: [{ type: 'app-layers' }],
            allow: [
              { to: { type: 'app-layers' } },     // modules within layers
              { to: { type: 'primitives' } },
              { to: { type: 'features' } },
              { to: { type: "app-compositions" } },
            ]
          },
          {
            from: [{ type: 'app-scenes' }],
            allow: [
              { to: { type: 'primitives' } },
              { to: { type: 'composites' } },
              { to: { type: 'features' } },
              { to: { type: 'app-scenes' } },
            ]
          },
          // app (compositions catchall) — only gets the * implicit rules

          // ─── ui building blocks ────────────────────────────────────────
          {
            from: [{ type: 'features' }],
            allow: [
              { to: { type: 'features' } },       // self — subfolders within a feature
              { to: { type: 'primitives' } },
              { to: { type: 'infrastructure' } },
            ]
          },
          {
            from: [{ type: 'composites' }],
            allow: [
              { to: { type: 'primitives' } },
              { to: { type: 'infrastructure' } },
            ]
          },
          {
            from: [{ type: 'primitives' }],
            allow: [
              { to: { type: 'primitives' } },     // self — hooks/utils within a primitive
            ]
          },
          {
            from: [{ type: 'infrastructure' }],
            allow: [
              { to: { type: 'infrastructure' } },     // self — hooks/utils within a primitive
            ]
          },

          // ─── interaction ───────────────────────────────────────────────
          {
            from: [{ type: 'interaction-core' }],
            allow: [
              { to: { type: 'interaction-core' } }, // self — contained within core
            ]
          },
          {
            from: [{ type: 'interaction-pipeline' }],
            allow: [
              { to: { type: 'interaction-core' } },
              { to: { type: 'interaction-solvers' } },
              { to: { type: 'interaction-updater' } },
              { to: { type: 'primitives' } },       // zustand stores — TODO: narrow further?
            ]
          },
          {
            from: [{ type: 'interaction-solvers' }],
            allow: [
              { to: { type: 'interaction-solvers' } }, // self — solver utils
            ]
          },
          {
            from: [{ type: 'interaction-updater' }],
            allow: [
              { to: { type: 'interaction-pipeline' } },
            ]
          }
        ]
      }]
    }
  },
  // ─── test-only API enforcement ─────────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/test/**/*'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          regex: '.*',
          importNames: ['__TEST_ONLY_API'],
          message: '__TEST_ONLY_API is for tests only'
        }]
      }]
    }
  }
])