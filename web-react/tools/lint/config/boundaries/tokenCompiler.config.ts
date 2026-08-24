import type { Linter } from 'eslint'


const config: Linter.Config = {

  files: ['tools/token-compiler/**/*.{ts,js}'],

  settings: {
    // Required so eslint-plugin-boundaries resolves TS extensionless imports
    'import/resolver': {
      typescript: {
        project: './tools/token-compiler/tsconfig.json',
        alwaysTryTypes: true,
      },
    },

    //       Captured module	folder/*/**, capture...
    //        Flat ownership folder	folder/**
    //        Recursive folder tree without capture	folder/**/*
    //         Child namespace ownership	folder/*/**

    'boundaries/elements': [

      { type: 'compiler', pattern: 'tools/token-compiler/src/compiler/*/**', capture: ['mod'] },
      { type: 'diagnostics', pattern: 'tools/token-compiler/src/diagnostics/*/**', capture: ['mod'] },
      { type: 'emitters', pattern: 'tools/token-compiler/src/emitters/*/**', capture: ['mod'] },
      { type: 'postCss', pattern: 'tools/token-compiler/src/postCss/*/**', capture: ['mod'] },
      { type: 'tokenTypes', pattern: 'tools/token-compiler/src/types/**' },
      { type: 'utils', pattern: 'tools/token-compiler/src/oldSharedUtils/**' }
    ],
    'boundaries/files': [

      { pattern: 'tools/token-compiler/**/*.boundary.ts', category: 'boundary' },
      { pattern: 'tools/token-compiler/**/*.types.ts', category: 'types' },
      { pattern: 'tools/token-compiler/tools/token-compiler**/compilerService.ts', category: 'compilerService' },
      { pattern: 'tools/token-compiler/**/runDiagnostics.ts', category: 'runDiagnostics' },
      { pattern: 'tools/token-compiler/**/emitFiles.ts', category: 'emitFiles' },
      { pattern: 'tools/token-compiler/**/processModule.ts', category: 'processModule' },
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
      'tools/token-compiler/src/test/**/*',
      // '**/src/assets/**/*',
      // Boundary regression fixtures
      // '**/src/**/*.boundary.ts'
      // '**/src/blocks/**/block.boundary.ts',
    ],

  }
}

export default config