import resolveTokenGroup from '../resolvers/resolveTokenGroup.ts';
import loadToken from '../loaders/loadToken.ts';
import buildTokenGroup from '../builders/buildTokenGroup.ts';
import type { LoadedToken, TokenGroup } from '../../types/compiler.types.ts';

export default function buildTokenGroups(
  tokenPaths: string[],
  cssMap: Map<string, string>
): TokenGroup[] {

  const groups = new Map<string, LoadedToken[]>();

  for (const tokenPath of tokenPaths) {
    const groupPath = resolveTokenGroup(tokenPath);

    const tokens = groups.get(groupPath) ?? [];

    tokens.push(loadToken(tokenPath));

    groups.set(groupPath, tokens);
  }

  const result: TokenGroup[] = [];

  for (const [groupPath, tokens] of groups) {
    result.push(
      buildTokenGroup(
        groupPath,
        tokens,
        cssMap.get(groupPath),
      )
    );
  }

  return result;
}