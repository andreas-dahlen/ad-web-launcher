const appBoundaryFiles = [
  { pattern: '**/*.boundary.ts', category: 'boundary' },
  { pattern: 'src/app/*.{ts,tsx}', category: 'app-entry' },

  { pattern: 'src/**/*.store.ts', category: 'stores' },
  { pattern: 'src/**/*.types.ts', category: 'types' },
  { pattern: 'src/**/*.d.ts', category: 'types' },

  { pattern: 'src/**/buildDesc.ts', category: 'buildDesc' },
  { pattern: 'src/**/pipeline.ts', category: 'pipeline' },
  { pattern: 'src/**/solverRouter.ts', category: 'solverRouter' },
  { pattern: 'src/**/gesture.utils.ts', category: 'gestureUtils' },

  { pattern: 'src/styleTokens/tokens/**/*.{json,jsonc}', category: 'tokenData' },
]

const compilerBoundaryFiles = [
  { pattern: 'tools/token-compiler/**/*.boundary.ts', category: 'boundary' },
  { pattern: 'tools/token-compiler/**/*.types.ts', category: 'types' },
  { pattern: 'tools/token-compiler/**/compilerService.ts', category: 'compilerService' },
  { pattern: 'tools/token-compiler/**/runDiagnostics.ts', category: 'runDiagnostics' },
  { pattern: 'tools/token-compiler/**/emitFiles.ts', category: 'emitFiles' },
  { pattern: 'tools/token-compiler/**/processModule.ts', category: 'processModule' },
]

export const boundariesFiles = [
  ...appBoundaryFiles,
  ...compilerBoundaryFiles,
]