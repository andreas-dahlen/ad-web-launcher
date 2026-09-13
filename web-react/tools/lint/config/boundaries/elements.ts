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
  { type: 'styleTokens', pattern: 'src/styleTokens/*/**', capture: ['mod'] },
]

const compilerBoundaryElements = [
  { type: 'compiler', pattern: 'tools/cascade-compiler/src/compiler/*/**', capture: ['mod'] },
  { type: 'diagnostics', pattern: 'tools/cascade-compiler/src/diagnostics/*/**', capture: ['mod'] },
  { type: 'emitters', pattern: 'tools/cascade-compiler/src/emitters/*/**', capture: ['mod'] },
  { type: 'postCss', pattern: 'tools/cascade-compiler/src/postCss/*/**', capture: ['mod'] },
  { type: 'tokenTypes', pattern: 'tools/cascade-compiler/src/types/**' },
  { type: 'utils', pattern: 'tools/cascade-compiler/src/oldSharedUtils/**' },
]

export const boundariesElements = [
  ...appBoundaryElements,
  ...compilerBoundaryElements,
]