export const baseCoverageExclude = [
  '**/test/**',
  '**/*.css',
  '**/*.types.ts',
  '**/*.d.ts',
  '**/*.factory.ts',
  '**/*.fixture.ts',
  '**/*.env.d.ts',
  '**/*.env.ts',
  '**/*-plugin.ts'
]

export const compilerCoverageExclude = [
  '**/cli.ts',
  '**/src/public/index.ts',
  '**/src/public/vite.ts',
  '**/runDiagnostics.ts',
  '**/emitFiles.ts',
  '**/composeOutput.ts',
]

export const cascadeVscodeCoverageExclude = [
  '**/createTerminal.ts',
  '**/statusBar.ts',
  '**/subscriptions.ts'
]

export const lintCoverageExclude = [
  "**/tools/lint/config/**/*.ts"
]