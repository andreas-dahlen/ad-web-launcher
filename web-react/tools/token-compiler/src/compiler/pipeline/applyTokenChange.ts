import type { TokenGroupResult } from '../../types/compiler.types.js';
import type { TokenCache } from '../tracking/tokenCache.js';
import { buildTokenGroup } from '../builders/buildTokenGroup.js';
import { resolveTokenGroupPath } from '../resolvers/resolveTokenGroupPath.js'
import { processToken } from '../processing/processToken.js';
import { findCssModulePath } from '../discovery/findCssModulePath.js';
import { findTokenPaths } from '../discovery/findTokenPaths.js';

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

  const tokens = results.map(result => result.token);
  const issues = results.flatMap(result => result.issues);

  const group = buildTokenGroup(groupPath, tokens, cssPath);

  if (staleGroup) {
    cache.removeGroup(staleGroup);
  }

  cache.addGroup(group);

  return { group, issues };
}