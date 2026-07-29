import resolveTokenGroupPath from '../resolvers/resolveTokenGroupPath.ts'
import loadToken from '../loaders/loadToken.ts';
import buildTokenGroup from '../builders/buildTokenGroup.ts';
import type { LoadedGroupsResult, TokenGroup } from '../../types/compiler.types.ts';
import createModuleMap from '../discovery/createModuleMap.ts'
import type { Issue } from '../../../shared/tokenUtils/prefixes.ts';

export default function createTokenGroups(
  tokenPaths: string[],
): LoadedGroupsResult {

  const groupPaths = [
    ...new Set(tokenPaths.map(resolveTokenGroupPath))
  ];

  const cssMap = createModuleMap(groupPaths);

  const groups = new Map<string, TokenGroup>();
  const issues: Issue[] = []
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
    const groupPath = resolveTokenGroupPath(tokenPath);

    const group = groups.get(groupPath);

    if (!group) {
      throw new Error(`Missing token group: ${groupPath}`);
    }
    const result = loadToken(tokenPath);

    issues.push(...result.issues);
    group.tokens.push(result.token);
  }

  // eslint-disable-next-line unicorn/prefer-iterator-to-array
  return { groups: [...groups.values()], issues };
}