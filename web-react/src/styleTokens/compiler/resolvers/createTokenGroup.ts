
import type { TokenGroup } from './createTokenGroups.ts';
import loadTokens from "../loaders/loadTokens.ts";

export default function createTokenGroup(
  groupPath: string,
  cssPath: string,
): TokenGroup {

  if (!cssPath) {
    throw new Error(`Missing CSS module for ${groupPath}`);
  }

  return {
    groupPath,
    cssPath,
    tokens: loadTokens(groupPath),
  };
}