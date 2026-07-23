import createTokenGroups from './resolvers/createTokenGroups.ts';
import { createTokenCache } from './state/tokenCache.ts';
// import validate from './validation/validateJson';
import reporter from "./logging/tokenReport.ts"
import log from './logging/consoleLog.ts';
import findTokenPaths from './loaders/findTokenPaths.ts';
import findModulePaths from './resolvers/findModulePaths.ts';
import createTokenGroup from './resolvers/createTokenGroup.ts';



export function initializeCompiler(tokensDir: string) {
  const tokenPaths = findTokenPaths(tokensDir);
  const cssGroupMap = findModulePaths(tokenPaths);
  const groups = createTokenGroups(tokenPaths, cssGroupMap);
  const cache = createTokenCache(groups);

  syncCompiler();

  return {
    cache,
    refreshCompiler,
    syncCompiler,
  };


  function refreshCompiler(groupPath: string, cssPath: string) {
    const group = createTokenGroup(groupPath, cssPath);

    cache.replaceGroup(group);

    syncCompiler();
  }

  function syncCompiler() {
    const tokens = cache.tokens();

    reporter.expectTokens(tokens);
    log.jsonsLoaded(tokens);
  }
}