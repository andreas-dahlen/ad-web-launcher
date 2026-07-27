import type { CssVarString } from '../../../../shared/tokenUtils/compiler.types.ts';
import { toCssVar, toCssVarPrefix } from '../../../../shared/tokenUtils/stringFormaters.ts';
import type { CssData, CssTokenGroup } from '@styleTokens/types/compiler.types.ts';
export type VariableMismatch = {
  name: string;
  infix: string;
  missing: CssVarString[];
  unused: CssVarString[];
};
export default function analyzeVariableUsage(cssData: CssData, group: CssTokenGroup): VariableMismatch[] {
  const result: VariableMismatch[] = []

  const found = new Set(cssData.foundVariables);

  for (const token of group.tokens) {
    const declared = new Set(
      token.vars.map(variable =>
        toCssVar("final", token.infix, variable.name)
      )
    );

    const missing: CssVarString[] = [];
    const unused: CssVarString[] = [];

    for (const cssVar of found) {
      if (
        cssVar.startsWith(toCssVarPrefix("final", token.infix)) &&
        !declared.has(cssVar)
      ) {
        missing.push(cssVar);
      }
    }

    for (const cssVar of declared) {
      if (!found.has(cssVar)) {
        unused.push(cssVar);
      }
    }

    if (missing.length > 0 || unused.length > 0) {
      result.push({
        name: token.name,
        infix: token.infix,
        missing,
        unused,
      });
    }
  }

  return result
}