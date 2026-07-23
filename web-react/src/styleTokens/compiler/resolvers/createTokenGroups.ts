import type { LoadedToken } from "../loaders/loadToken.ts";
import resolveTokenGroup from "../../../shared/tokenUtils/resolveTokenGroup.ts";
import loadToken from '../loaders/loadToken.ts';

export interface TokenGroup {
  groupPath: string;
  cssPath: string;
  tokens: LoadedToken[];
}

export default function createTokenGroups(
  tokenPaths: string[],
  cssMap: Map<string, string>
): TokenGroup[] {

  const groups = new Map<string, TokenGroup>();

  for (const tokenPath of tokenPaths) {
    const groupPath = resolveTokenGroup(tokenPath);

    let group = groups.get(groupPath);

    if (!group) {
      group = {
        groupPath,
        cssPath: cssMap.get(groupPath) ?? "",
        tokens: [],
      };

      groups.set(groupPath, group);
    }

    group.tokens.push(loadToken(tokenPath));
  }

  // eslint-disable-next-line unicorn/prefer-iterator-to-array
  return [...groups.values()];
}