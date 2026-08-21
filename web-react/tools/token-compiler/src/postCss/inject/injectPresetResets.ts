import type { CssVarString } from '../../oldSharedUtils/oldSharedCompiler.types.js';
import type { CompilerVariable, CssTokenGroup, PresetResetData } from '../../types/compiler.types.js';

export function injectPresetResets(
  data: PresetResetData,
  group: CssTokenGroup,
): void {
  for (const [rule, variables] of data) {
    for (const cssVar of variables) {
      const variable = findVariable(cssVar, group)

      if (!variable?.effectiveAllowed.includes('p')) {
        continue
      }

      rule.append({
        prop: toPresetVar(cssVar),
        value: 'initial',
      })
    }
  }
}

function toPresetVar(cssVar: CssVarString): CssVarString {
  return cssVar.replace("--final-", "--p-") as CssVarString;
}

function findVariable(
  cssVar: CssVarString,
  group: CssTokenGroup,
): CompilerVariable | undefined {

  for (const token of group.tokens) {
    const prefix = `${token.infix}-`

    if (!cssVar.startsWith(`--final-${prefix}`)) {
      continue
    }

    const cssName = cssVar.slice(`--final-${prefix}`.length)

    return token.vars.find(
      variable => variable.cssName === cssName,
    )
  }

  return undefined
}