import type { CssVarString } from '../../../types/cascade.types.ts';
import type { PostData } from '../../../types/compiler.types.ts';
import type { ExtensionData, TokenGroupData } from '../../../types/emitter.types.ts';
import { toCssVar } from '../../../utils/stringFormaters.ts';

export function assembleExtensionData(postData: PostData[], tokenData: TokenGroupData[]): ExtensionData[] {
  const files = new Map<string, Set<CssVarString>>()

  for (const { cssPath, variables } of postData) {
    const fileVariables = files.get(cssPath) ?? new Set<CssVarString>()

    for (const variable of variables) {
      fileVariables.add(variable)
    }
    files.set(cssPath, fileVariables)
  }

  for (const group of tokenData) {
    const fileVariables = files.get(group.cssPath) ?? new Set<CssVarString>()

    for (const token of group.tokens) {
      for (const variable of token.variables) {
        fileVariables.add(
          toCssVar("final", token.infix, variable.cssName),
        )
        for (const allowed of variable.allowed) {
          fileVariables.add(
            toCssVar(allowed, token.infix, variable.cssName),
          )
        }
      }
    }
    files.set(group.cssPath, fileVariables)
  }

  return Array.from(files, ([cssPath, variables]) => ({
    cssPath,
    variables: [...variables]
  }))
}