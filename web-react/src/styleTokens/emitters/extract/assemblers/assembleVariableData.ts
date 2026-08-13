import type { TokenData } from './assembleTokenData.ts';
import type { PostData } from '../../../postCss/processPost.ts';
import type { CssVarString } from '../../../../shared/tokenUtils/compiler.types.ts';
import { toCssVar } from '../../../../shared/tokenUtils/stringFormaters.ts';


export function assembleVariableData(postData: PostData[], tokenData: TokenData[]): CssVarString[] {

  const variables = new Set<CssVarString>

  for (const post of postData) {
    for (const variable of post.variables) {
      variables.add(variable)
    }
  }

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
  return [...variables]
}