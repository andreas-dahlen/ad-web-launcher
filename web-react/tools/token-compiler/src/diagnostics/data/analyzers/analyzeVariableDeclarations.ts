import type { CssVarString } from '../../../oldSharedUtils/oldSharedCompiler.types.js';
import { toCssVar } from '../../../oldSharedUtils/stringFormaters.js';
import type { CssDataTokenGroup } from '../../../types/compiler.types.js';
import type { InvalidVarDeclaration } from '../../../types/diagnostics.types.js';
export function analyzeVariableDeclarations(group: CssDataTokenGroup): InvalidVarDeclaration[] {

  const result: InvalidVarDeclaration[] = []

  const found = new Set(group.cssData.declaredVariables);

  for (const token of group.tokens) {

    const invalid: CssVarString[] = [];

    for (const variable of token.vars) {

      const allowed = new Set(
        variable.effectiveAllowed.map(prefix =>
          toCssVar(prefix, token.infix, variable.cssName)
        )
      )

      for (const cssVar of found) {
        if (
          cssVar.includes(`-${token.infix}-${variable.cssName}`) &&
          !allowed.has(cssVar)
        ) {
          invalid.push(cssVar);
        }
      }
    }

    if (invalid.length > 0) {
      result.push({
        name: token.name,
        infix: token.infix,
        invalid
      })
    }
  }

  return result
}