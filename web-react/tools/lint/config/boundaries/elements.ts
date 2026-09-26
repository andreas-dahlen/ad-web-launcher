const appBoundaryElements = [
  { type: 'api', pattern: 'src/api/**' },
  { type: 'app', pattern: 'src/app/*/**', capture: ['mod'] },
  { type: 'blocks', pattern: 'src/blocks/**' },
  { type: 'composites', pattern: 'src/composites/*/**', capture: ['mod'] },
  { type: 'config', pattern: 'src/config/**' },
  { type: 'data', pattern: 'src/data/*/**', capture: ['mod'] },
  { type: 'features', pattern: 'src/features/**' },
  { type: 'interaction', pattern: 'src/interaction/*/**', capture: ['mod'] },
  { type: 'panels', pattern: 'src/panels/*/**', capture: ['mod'] },
  { type: 'primitives', pattern: 'src/primitives/*/**', capture: ['mod'] },
  { type: 'shared', pattern: 'src/shared/*/**', capture: ['mod'] },
  { type: 'test', pattern: 'src/test/**' },
  { type: 'tokens', pattern: 'src/tokens/**' }
]

const compilerBoundaryElements = [
  { type: 'compiler', pattern: 'tools/cascade-compiler/src/compiler/*/**', capture: ['mod'] },
  { type: 'analysisAnalyzers', pattern: 'tools/cascade-compiler/src/diagnostics/analysis/analyzers/**' },
  { type: 'reportSections', pattern: 'tools/cascade-compiler/src/diagnostics/report/sections/**' },

  { type: 'composeFormat', pattern: 'tools/cascade-compiler/src/emitters/compose/format/**' },
  { type: 'extractAssemblers', pattern: 'tools/cascade-compiler/src/emitters/extract/assemblers/**' },
  { type: 'write', pattern: 'tools/cascade-compiler/src/emitters/write/**' },

  { type: 'entries', pattern: 'tools/cascade-compiler/src/entries/*/**', capture: ['mod'] },
  { type: 'package', pattern: 'tools/cascade-compiler/src/package/*/**', capture: ['mod'] },
  { type: 'postCss', pattern: 'tools/cascade-compiler/src/postCss/*/**', capture: ['mod'] },
  { type: 'schema', pattern: 'tools/cascade-compiler/src/schema/**' },
  { type: 'utils', pattern: 'tools/cascade-compiler/src/utils/**' },
  { type: 'vite', pattern: 'tools/cascade-compiler/src/vite/**' },
  { type: 'test', pattern: 'tools/cascade-compiler/test/**' },
]

const matchSuggestionsBoundaryElements = [
  { type: 'completion', pattern: 'tools/extensions/match-suggestions/src/completion/**' },
  { type: 'schemas', pattern: 'tools/extensions/match-suggestions/src/schemas/**' },
  { type: 'snippets', pattern: 'tools/extensions/match-suggestions/src/snippets/**' },
  { type: 'types', pattern: 'tools/extensions/match-suggestions/src/types/**' },
  { type: 'test', pattern: 'tools/extensions/match-suggestions/src/test/**' },
]
const cascadeVscodeBoundaryElements = [
  { type: 'config', pattern: 'tools/extensions/cascade-vscode/src/config/**' },
  { type: 'terminal', pattern: 'tools/extensions/cascade-vscode/src/terminal/**' },
  { type: 'vscode', pattern: 'tools/extensions/cascade-vscode/src/vscode/**' },
  { type: 'test', pattern: 'tools/extensions/cascade-vscode/src/test/**' },
]

const cssVariableCompletionBoundaryElements = [
  { type: 'completion', pattern: 'tools/extensions/css-variable-completion/src/completion/**' },
  { type: 'config', pattern: 'tools/extensions/css-variable-completion/src/config/**' },
  { type: 'lsp', pattern: 'tools/extensions/css-variable-completion/src/lsp/**' },
  { type: 'variables', pattern: 'tools/extensions/css-variable-completion/src/variables/**' },
  { type: 'test', pattern: 'tools/extensions/css-variable-completion/src/test/**' },
]

const projectLintBoundaryElements = [
  { type: 'helpers', pattern: 'tools/extensions/project-lint/src/helpers/**' },
  { type: 'oxlint', pattern: 'tools/extensions/project-lint/src/oxlint/**' },
  { type: 'vscode', pattern: 'tools/extensions/project-lint/src/vscode/**' },
  { type: 'test', pattern: 'tools/extensions/project-lint/src/test/**' },
]


export const boundariesElements = [
  ...appBoundaryElements,
  ...compilerBoundaryElements,
  ...cascadeVscodeBoundaryElements,
  ...cssVariableCompletionBoundaryElements,
  ...projectLintBoundaryElements,
  ...matchSuggestionsBoundaryElements,
]