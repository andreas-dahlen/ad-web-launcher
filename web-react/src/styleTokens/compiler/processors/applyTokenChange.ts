import buildTokenGroup from '../builders/buildTokenGroup.ts';
import type { TokenCache } from '../state/tokenCache.ts';
import resolveTokenGroup from '../resolvers/resolveTokenGroup.ts';
import findCssModulePath from '../discovery/findCssModulePath.ts';
import loadToken from '../loaders/loadToken.ts';
import findTokenPaths from '../discovery/findTokenPaths.ts';

export default function applyTokenChange({
  tokenPath,
  cache,
}: {
  tokenPath: string;
  cache: TokenCache;
}) {
  const staleGroup = cache.getGroupByTokenPath(tokenPath);
  //rename to staleGroup?
  const groupPath =
    staleGroup?.groupPath ?? resolveTokenGroup(tokenPath);

  const cssPath = findCssModulePath(groupPath);

  const tokenPaths = findTokenPaths(groupPath);
  const tokens = tokenPaths.map(loadToken)

  if (!cssPath) {
    //TODO VAlidate? i mean throw log... return error msg is probably the implementation i am thinking...
  }

  const group = buildTokenGroup(groupPath, tokens, cssPath);

  if (staleGroup) {
    cache.removeGroup(staleGroup);
  }

  cache.addGroup(group);

  return cssPath;
}