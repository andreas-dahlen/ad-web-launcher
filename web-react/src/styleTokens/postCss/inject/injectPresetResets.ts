import type { CssVarString } from '../../../shared/tokenUtils/compiler.types.ts';
import type { PresetResetData } from '../../types/compiler.types.ts';




export function injectPresetResets(data: PresetResetData): void {
  for (const [rule, variables] of data) {

    for (const cssVar of variables) {

      rule.append({
        prop: toPresetVar(cssVar),
        value: "initial",
      });
    }
  }
}

function toPresetVar(cssVar: CssVarString): CssVarString {
  return cssVar.replace("--final-", "--p-") as CssVarString;
}