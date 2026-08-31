import type { TokenData } from './assembleTokenData.js';
import type { CssVarString } from '../../../oldSharedUtils/oldSharedCompiler.types.js';
import { toCssVar } from '../../../oldSharedUtils/stringFormaters.js';
import path from 'node:path';

export type ExtensionData = {
  variables: CssVarString[]
  outputFile: string
}

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

  const outputFile = path.join(outPath, "metadata/extension.generated.jsonc")

  return { variables: [...variables], outputFile }
}