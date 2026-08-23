import type { VariableMismatch } from '../../../types/diagnostics.types.js';
import type { CssVarString } from '../../../oldSharedUtils/oldSharedCompiler.types.js';
import { toCssVar, toCssVarPrefix } from '../../../oldSharedUtils/stringFormaters.js';
import type { CssDataTokenGroup } from '../../../types/compiler.types.js';

export function analyzeVariableUsage(group: CssDataTokenGroup): VariableMismatch[] {
  const result: VariableMismatch[] = []

  const found = new Set(group.cssData.foundFinalVariables);

  for (const token of group.tokens) {
    const declared = new Set(
      token.vars.map(variable =>
        toCssVar("final", token.infix, variable.cssName)
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