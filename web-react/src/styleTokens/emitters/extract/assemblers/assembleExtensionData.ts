import type { TokenData } from './assembleTokenData.ts';
import type { CssVarString } from '../../../../shared/tokenUtils/compiler.types.ts';
import { toCssVar } from '../../../../shared/tokenUtils/stringFormaters.ts';

export type ExtensionData = {
  variables: CssVarString[]
}

export function assembleExtensionData(allVariables: CssVarString[], tokenData: TokenData[]): ExtensionData {
  const variables = new Set<CssVarString>(allVariables)

  for (const token of tokenData) {
    for (const variable of token.variables) {
      variables.add(
        toCssVar("final", token.infix, variable.cssName),
      )
      for (const allowed of variable.allowed) {
        variables.add(
          toCssVar(allowed, token.infix, variable.cssName),
        )
      }
    }
  }
  return { variables: [...variables] }
}