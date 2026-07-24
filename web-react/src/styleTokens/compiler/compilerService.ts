import type { Root } from 'postcss';
import findTokenPaths from './discovery/findTokenPaths.ts';
import findModulePaths from './discovery/findModulePaths.ts';
import buildTokenGroups from './builders/buildTokenGroups.ts';
import { createTokenCache } from './state/tokenCache.ts';
// import validate from './validation/validateJson';
import applyTokenChange from './processors/applyTokenChange.ts';
import processCssFile from '../postCss/processCssFile.ts'
import createDiagnosticLog from '../diagnostics/createDiagnostics.ts';
export type TokenCompiler = ReturnType<typeof initializeCompiler>;

export function initializeCompiler(tokensDir: string) {
  const tokenPaths = findTokenPaths(tokensDir);
  const cssGroupMap = findModulePaths(tokenPaths);
  const groups = buildTokenGroups(tokenPaths, cssGroupMap);
  const cache = createTokenCache(groups);
  //validation?
  const log = createDiagnosticLog()
  syncCompiler();

  return {
    processCss,
    handleTokenChange
  };

  function handleTokenChange(tokenPath: string) {
    const cssPath = applyTokenChange({
      tokenPath,
      cache,
    })

    if (!cssPath) return;

    syncCompiler()

    return cssPath
  }

  function syncCompiler() {
    log.resync(cache)
    //validation?
    // report.expectTokens(tokens)
    // log.jsonsLoaded(tokens)
  }

  function processCss(root: Root, cssPath: string): void {
    const group = cache.getGroupByCssPath(cssPath)
    if (!group) return
    processCssFile({ root, group, log })
  }
}