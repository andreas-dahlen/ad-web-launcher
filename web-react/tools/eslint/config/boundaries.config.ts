import type { Linter } from 'eslint'


const config: Linter.Config = {

  files: ['src/**/*.{ts,tsx}'],

  settings: {
    // Required so eslint-plugin-boundaries resolves TS extensionless imports
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
        alwaysTryTypes: true,
      },
    },

    //       Captured module	folder/*/**, capture...
    //        Flat ownership folder	folder/**
    //        Recursive folder tree without capture	folder/**/*
    //         Child namespace ownership	folder/*/**

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
      { type: 'generated', pattern: 'src/styleTokens/*/**', capture: ['mod'] },



      // { type: 'compiler', pattern: 'src/styleTokens/compiler/*/**', capture: ['mod'] },
      // { type: 'diagnostics', pattern: 'src/styleTokens/diagnostics/*/**', capture: ['mod'] },
      // { type: 'emitters', pattern: 'src/styleTokens/emitters/*/**', capture: ['mod'] },
      // { type: 'postCss', pattern: 'src/styleTokens/postCss/*/**', capture: ['mod'] },
      // { type: 'tokenTypes', pattern: 'src/styleTokens/types/**' },
      // { type: 'utils', pattern: 'src/styleTokens/utils/**' }
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
      { pattern: '**/gesture.utils.ts', category: 'gestureUtils' },

      { pattern: '**/compilerService.ts', category: 'compilerService' },
      { pattern: '**/runDiagnostics.ts', category: 'runDiagnostics' },
      { pattern: '**/emitFiles.ts', category: 'emitFiles' },
      { pattern: '**/processModule.ts', category: 'processModule' },

      { pattern: "src/styleTokens/tokens/**/*.{json,jsonc}", category: "tokenData" }
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

  }
}

export default config