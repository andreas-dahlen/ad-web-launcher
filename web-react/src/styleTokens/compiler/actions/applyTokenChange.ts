import buildTokenGroup from '../builders/buildTokenGroup.ts';
import type { TokenCache } from '../state/tokenCache.ts';
import resolveTokenGroupPath from '../resolvers/resolveTokenGroupPath.ts'
import findCssModulePath from '../discovery/findCssModulePath.ts';
import loadToken from '../loaders/loadToken.ts';
import findTokenPaths from '../discovery/findTokenPaths.ts';
import type { LoadedGroupResult } from '@styleTokens/types/compiler.types.ts';
// import type { TokenGroup } from '@styleTokens/types/compiler.types.ts';

export default function applyTokenChange({
  tokenPath,
  cache,
}: {
  tokenPath: string;
  cache: TokenCache;
}): LoadedGroupResult {
  const staleGroup = cache.getGroupByTokenPath(tokenPath);

  const groupPath =
    staleGroup?.groupPath ?? resolveTokenGroupPath(tokenPath);

  const cssPath = findCssModulePath(groupPath);

  const tokenPaths = findTokenPaths(groupPath);
  const results = tokenPaths.map(loadToken);

  const tokens = results.map(result => result.token);
  const issues = results.flatMap(result => result.issues);

  const group = buildTokenGroup(groupPath, tokens, cssPath);

  if (staleGroup) {
    cache.removeGroup(staleGroup);
  }

  cache.addGroup(group);

  return { group, issues };
}