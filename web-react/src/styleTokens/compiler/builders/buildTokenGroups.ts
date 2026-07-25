import resolveTokenGroup from '../resolvers/resolveTokenGroup.ts';
import loadToken from '../loaders/loadToken.ts';
import buildTokenGroup from '../builders/buildTokenGroup.ts';
import type { TokenGroup } from '../../types/compiler.types.ts';
import createModuleMap from '../discovery/createModuleMap.ts'

export default function createTokenGroups(
  tokenPaths: string[],
): TokenGroup[] {

  const groupPaths = [
    ...new Set(tokenPaths.map(resolveTokenGroup))
  ];

  const cssMap = createModuleMap(groupPaths);

  const groups = new Map<string, TokenGroup>();

  // create group shells
  for (const groupPath of groupPaths) {
    groups.set(
      groupPath,
      buildTokenGroup(
        groupPath,
        [],
        cssMap.get(groupPath),
      )
    );
  }

  // attach tokens
  for (const tokenPath of tokenPaths) {
    const groupPath = resolveTokenGroup(tokenPath);

    const group = groups.get(groupPath);

    if (!group) {
      throw new Error(`Missing token group: ${groupPath}`);
    }

    group.tokens.push(loadToken(tokenPath));
  }

  // eslint-disable-next-line unicorn/prefer-iterator-to-array
  return [...groups.values()];
}