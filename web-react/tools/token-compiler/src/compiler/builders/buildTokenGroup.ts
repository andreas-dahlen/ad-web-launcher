import type { CompilerToken, TokenGroup } from "../../types/compiler.types.js"
import { validateDuplicateVars } from './validateDuplicateVars.js';
export function buildTokenGroup(
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