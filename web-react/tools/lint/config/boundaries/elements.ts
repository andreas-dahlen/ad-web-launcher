const appBoundaryElements = [
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
  { type: 'tokens', pattern: 'src/tokens/*/**' }
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
]

//TODO add project to project boundaries to be able to see cross contamination

export const boundariesElements = [
  ...appBoundaryElements,
  ...compilerBoundaryElements,
]