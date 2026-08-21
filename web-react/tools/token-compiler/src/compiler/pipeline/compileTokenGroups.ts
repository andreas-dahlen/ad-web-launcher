import { resolveTokenGroupPath } from '../resolvers/resolveTokenGroupPath.js'
import { processToken } from '../processing/processToken.js';
import { buildTokenGroup } from '../builders/buildTokenGroup.js';
import type { TokenGroupsResult, TokenGroup } from '../../types/compiler.types.js';
import { createModuleMap } from '../discovery/createModuleMap.js'
import { type IssueGroup } from '../../types/issueCollector.types.js';

export function compileTokenGroups(
  rootPath: string,
  tokenPaths: string[],
): TokenGroupsResult {

  const groupPaths = [
    ...new Set(tokenPaths.map(resolveTokenGroupPath))
  ];

  const cssMap = createModuleMap(rootPath, groupPaths);

  const groups = new Map<string, TokenGroup>();
  const issues: IssueGroup[] = []
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
    const result = processToken(tokenPath);

    issues.push(...result.issues);
    group.tokens.push(result.token);
  }
  // eslint-disable-next-line unicorn/prefer-iterator-to-array
  return { groups: [...groups.values()], issues };
}