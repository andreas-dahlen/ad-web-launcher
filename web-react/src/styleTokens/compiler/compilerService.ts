import type { Root } from 'postcss';
import findTokenPaths from './discovery/findTokenPaths.ts';
import buildTokenGroups from './builders/buildTokenGroups.ts';
import { createTokenCache } from './state/tokenCache.ts';
// import validate from './validation/validateJson';
import applyTokenChange from './processors/applyTokenChange.ts';
import processModule from '../postCss/processModule.ts'
import createDiagnosticService from '../diagnostics/diagnosticService.ts';
import { createProcessingTracker } from './state/processingTracker.ts';
// import createReporter from '../diagnostics//report/reporter.ts';
export type TokenCompiler = ReturnType<typeof initializeCompiler>;

export function initializeCompiler(tokensDir: string) {
  const tokenPaths = findTokenPaths(tokensDir);
  const groups = buildTokenGroups(tokenPaths);
  const cache = createTokenCache(groups);
  //validation?
  const diagnostics = createDiagnosticService()
  const tracker = createProcessingTracker(cache.cssPaths())

  return {
    runCssModule,
    handleTokenChange
  };

  function handleTokenChange(tokenPath: string) {
    diagnostics.reset();
    const cssPath = applyTokenChange({
      tokenPath,
      cache,
    })

    if (!cssPath) return;

    tracker.invalidate(cssPath); //HELLO YOUNG PADOWAN... need to update tracker to also contain potential new files if they're created (sync)

    return cssPath //triggers processCss
  }

  //TODO deserves a rename..
  function runCssModule(root: Root, cssPath: string): void {
    const group = cache.getGroupByCssPath(cssPath)

    //diagnostics.recordAllCssModulesFound
    if (!group) {
      // diagnostics.recordUnknownCss(cssPath);
      return
    }

    const cssData = processModule({ root, group })

    cache.updateCssData(cssData)
    tracker.markProcessed(cssPath)
    // diagnostics.recordCssData(cssData)

    if (tracker.isComplete()) {
      console.log("GOAL!")
      // const groups = cache.groups()
      //build stuff with the groups...


      //report...
    }
  }
}