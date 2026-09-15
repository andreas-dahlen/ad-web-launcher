import type { CssVarString } from '../../../types/cascade.types.ts';
import type { ExtensionData, TokenData } from '../../../types/emitter.types.ts';
import { toCssVar } from '../../../utils/stringFormaters.ts';

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

  const outputFile = "metadata/extension.jsonc"

  return { variables: [...variables], outputFile }
}