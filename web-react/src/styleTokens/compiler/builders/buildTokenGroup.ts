import type { LoadedToken, TokenGroup } from "../../types/compiler.types.ts"
import validateDuplicateVars from '../../validation/validateDuplicateVars.ts';
export default function buildTokenGroup(
  groupPath: string,
  tokens: LoadedToken[],
  cssPath?: string,
): TokenGroup {

  validateDuplicateVars(tokens)

  if (!cssPath) {
    //TODO report missing css path!!
  }

  return {
    groupPath,
    cssPath,
    tokens
  };
}