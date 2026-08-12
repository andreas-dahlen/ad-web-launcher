import type { CssVarString } from '../../../../shared/tokenUtils/compiler.types.ts';
import { toCssVar } from '../../../../shared/tokenUtils/stringFormaters.ts';
import type { CssData, CssTokenGroup } from '../../../types/compiler.types.ts';
import type { InvalidVarDeclaration } from '../../../types/diagnostics.types.ts';
export function analyzeVariableDeclarations(cssData: CssData, group: CssTokenGroup): InvalidVarDeclaration[] {

  const result: InvalidVarDeclaration[] = []

  const found = new Set(cssData.declaredVariables);

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