import type { Root } from 'postcss';
import findTokenPaths from './discovery/findTokenPaths.ts';
import buildTokenGroups from './builders/buildTokenGroups.ts';
import { createTokenCache } from './state/tokenCache.ts';
// import validate from './validation/validateJson';
import applyTokenChange from './processors/applyTokenChange.ts';
import processModule from '../postCss/processModule.ts'
import { createProcessingTracker } from './state/processingTracker.ts';
import createCompilerRun from './state/compilerRun.ts';
import { assertHasCssPath } from '../validation/assersions.ts';
import runDiagnostics from '../diagnostics/runDiagnostics.ts';
import resolveProcessedGroups from './resolvers/resolveProcessedGroups.ts';
export type TokenCompiler = ReturnType<typeof initializeCompiler>;

export function initializeCompiler(tokensDir: string) {
  const tokenPaths = findTokenPaths(tokensDir)
  const groups = buildTokenGroups(tokenPaths)
  const cache = createTokenCache(groups)
  //validation?
  const tracker = createProcessingTracker(cache.getCssPaths())
  const run = createCompilerRun(cache.getMissingCssGroupPaths())

  return {
    runCssModule,
    handleTokenChange
  }

  function handleTokenChange(tokenPath: string) {
    run.reset()

    const group = applyTokenChange({
      tokenPath,
      cache,
    })

    if (!group.cssPath) {
      run.recordMissingModule(group.groupPath)
      runDiagnostics(cache, run)
      return
    }
    tracker.invalidate(group.cssPath)
    return group.cssPath //triggers runCssModule
  }

  function runCssModule(root: Root, cssPath: string): void {
    const group = cache.getGroupByCssPath(cssPath)

    if (!group) {
      tracker.markMissing(cssPath)
      run.recordUnusedModule(cssPath);

      handleCompletion()
      return
    }
    assertHasCssPath(group)
    const cssData = processModule({ root, group })

    run.recordCssData(group.groupPath, cssData)
    tracker.markProcessed(cssPath)

    handleCompletion()
  }

  function handleCompletion() {
    if (!tracker.hasFinished()) return
    // run.recordTrackerResult(tracker.getTrackerState or getTrackerResult())

    if (tracker.hasSucceeded()) {
      runBuild()
    }

    runDiagnostics(cache, run)
  }

  function runBuild() {
    const group = resolveProcessedGroups(cache, run)
    console.log("building", group.map(g => g.groupPath))
  }

  // function runDiagnostics() {
  //   runDiagnostics(cache, run)
  // }
}