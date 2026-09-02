import type { TokenGroupResult } from '../../types/compiler.types.ts';
import type { TokenCache } from '../tracking/tokenCache.ts';
import { buildTokenGroup } from '../builders/buildTokenGroup.ts';
import { resolveTokenGroupPath } from '../resolvers/resolveTokenGroupPath.ts'
import { processToken } from '../processing/processToken.ts';
import { findCssModulePath } from '../discovery/findCssModulePath.ts';
import { findTokenPaths } from '../discovery/findTokenPaths.ts';

export function applyTokenChange({
  tokenPath,
  cache,
}: {
  tokenPath: string
  cache: TokenCache
}): TokenGroupResult {
  const staleGroup = cache.getGroupByTokenPath(tokenPath);

  const groupPath =
    staleGroup?.groupPath ?? resolveTokenGroupPath(tokenPath);

  const { rootDir } = cache.getConfig()

  const cssPath = findCssModulePath(rootDir, groupPath);

  const tokenPaths = findTokenPaths(groupPath);
  const results = tokenPaths.map(tokenPath =>
    processToken(tokenPath)
  )

  const tokens = results.flatMap(result =>
    result.token ? [result.token] : []
  )
  const issues = results.flatMap(result => result.issues);

  const group = buildTokenGroup(groupPath, tokens, cssPath);

  if (staleGroup) {
    cache.removeGroup(staleGroup);
  }

  cache.addGroup(group);

  return { group, issues };
}