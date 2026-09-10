import type { CssVarString } from '../../../oldSharedUtils/oldSharedCompiler.types.ts';
import { toCssVar } from '../../../oldSharedUtils/stringFormaters.ts';
import path from 'node:path';
import type { ExtensionData, TokenData } from '../../../types/emitter.types.ts';

export function assembleExtensionData(allVariables: CssVarString[], tokenData: TokenData[], outPath: string): ExtensionData {
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

  const outputFile = path.join(outPath, "metadata/extension.jsonc")

  return { variables: [...variables], outputFile }
}