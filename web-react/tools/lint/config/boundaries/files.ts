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
  { pattern: 'tools/cascade-compiler/**/buildAnalysis.ts', category: 'buildAnalysis' },
  { pattern: 'tools/cascade-compiler/**/buildReport.ts', category: 'buildReport' },

  { pattern: 'tools/cascade-compiler/**/emitFiles.ts', category: 'emitFiles' },
  { pattern: 'tools/cascade-compiler/**/composeOutput.ts', category: 'composeOutput' },
  { pattern: 'tools/cascade-compiler/**/extractData.ts', category: 'extractData' },

  { pattern: 'tools/cascade-compiler/**/processModule.ts', category: 'processModule' },
  { pattern: 'tools/cascade-compiler/**/processPost.ts', category: 'processPost' },
  { pattern: 'tools/cascade-compiler/**/cli.ts', category: 'cli' },
  { pattern: 'tools/cascade-compiler/**/entry.ts', category: 'entry' },
  { pattern: 'tools/cascade-compiler/**/css.ts', category: 'css' },
  { pattern: 'tools/cascade-compiler/**/build.ts', category: 'build' },
  { pattern: 'tools/cascade-compiler/**/watch.ts', category: 'watch' },
  { pattern: 'tools/cascade-compiler/**/vite.ts', category: 'vite' },
]


const matchSuggestionFiles = [
  { pattern: 'tools/extensions/match-suggestions/src/extension.ts', category: 'entry' }
]
const cascadeVscodeFiles = [
  { pattern: 'tools/extensions/cascade-vscode/src/extension.ts', category: 'entry' }
]
const cssVariableCompletionFiles = [
  { pattern: 'tools/extensions/css-variable-completion/src/extension.ts', category: 'entry' }
]
const projectLintFiles = [
  { pattern: 'tools/extensions/project-lint/src/extension.ts', category: 'entry' }
]

export const boundariesFiles = [
  ...appBoundaryFiles,
  ...compilerBoundaryFiles,
  ...matchSuggestionFiles,
  ...cascadeVscodeFiles,
  ...cssVariableCompletionFiles,
  ...projectLintFiles
]