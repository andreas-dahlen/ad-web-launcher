import type { CompilerToken, TokenGroup } from "../../types/compiler.types.ts"
import validateDuplicateVars from './validateDuplicateVars.ts';
export default function buildTokenGroup(
  groupPath: string,
  tokens: CompilerToken[],
  cssPath?: string,
): TokenGroup {

  validateDuplicateVars(tokens)
  return {
    groupPath,
    cssPath,
    tokens
  };
}