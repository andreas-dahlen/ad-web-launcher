import type { LoadedToken, TokenGroup } from "../../types/compiler.types.ts"
import validateDuplicateVars from '../../validation/validateDuplicateVars.ts';
export default function buildTokenGroup(
  groupPath: string,
  tokens: LoadedToken[],
  cssPath?: string,
): TokenGroup {

  validateDuplicateVars(tokens)
  return {
    groupPath,
    cssPath,
    tokens
  };
}