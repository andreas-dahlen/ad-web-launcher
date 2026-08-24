export const appBoundaryElements = [
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

export const compilerBoundaryElements = [
  { type: 'compiler', pattern: 'tools/token-compiler/src/compiler/*/**', capture: ['mod'] },
  { type: 'diagnostics', pattern: 'tools/token-compiler/src/diagnostics/*/**', capture: ['mod'] },
  { type: 'emitters', pattern: 'tools/token-compiler/src/emitters/*/**', capture: ['mod'] },
  { type: 'postCss', pattern: 'tools/token-compiler/src/postCss/*/**', capture: ['mod'] },
  { type: 'tokenTypes', pattern: 'tools/token-compiler/src/types/**' },
  { type: 'utils', pattern: 'tools/token-compiler/src/oldSharedUtils/**' },
]

export const boundariesElements = [
  ...appBoundaryElements,
  ...compilerBoundaryElements,
]