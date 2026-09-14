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
  { pattern: 'tools/cascade-compiler/**/*.boundary.ts', category: 'boundary' },
  { pattern: 'tools/cascade-compiler/**/*.types.ts', category: 'types' },
  { pattern: 'tools/cascade-compiler/**/compilerService.ts', category: 'compilerService' },
  { pattern: 'tools/cascade-compiler/**/runDiagnostics.ts', category: 'runDiagnostics' },
  { pattern: 'tools/cascade-compiler/**/emitFiles.ts', category: 'emitFiles' },
  { pattern: 'tools/cascade-compiler/**/processModule.ts', category: 'processModule' },
  { pattern: 'tools/cascade-compiler/**/processPost.ts', category: 'processPost' },
  { pattern: 'tools/cascade-compiler/**/cli.ts', category: 'cli' },
  { pattern: 'tools/cascade-compiler/**/entry.ts', category: 'entry' },
  { pattern: 'tools/cascade-compiler/**/css.ts', category: 'css' },
  { pattern: 'tools/cascade-compiler/**/build.ts', category: 'build' },
  { pattern: 'tools/cascade-compiler/**/watch.ts', category: 'watch' },
]

export const boundariesFiles = [
  ...appBoundaryFiles,
  ...compilerBoundaryFiles,
]