import type { Root } from 'postcss';
import findTokenPaths from './discovery/findTokenPaths.ts';
import createTokenGroups from './pipeline/createTokenGroups.ts';
import applyTokenChange from './pipeline/applyTokenChange.ts';
import { createTokenCache } from './state/tokenCache.ts';
import { createProcessingTracker } from './state/processingTracker.ts';
import createCompilerRun from './state/compilerRun.ts';
import { createCompletionGuard } from './state/completionGuard.ts';
import processModule from '../postCss/processModule.ts'
import assert from './processing/assertions.ts'
import emitFiles from '../emitters/emitFiles.ts';
import runDiagnostics from '../diagnostics/runDiagnostics.ts';
export type TokenCompiler = ReturnType<typeof initializeCompiler>;

export function initializeCompiler(tokensDir: string) {
  const tokenPaths = findTokenPaths(tokensDir)
  const loaded = createTokenGroups(tokenPaths)
  const cache = createTokenCache(loaded.groups)
  const tracker = createProcessingTracker(cache.getCssPaths())
  const run = createCompilerRun(cache.getMissingCssGroupPaths())
  const guard = createCompletionGuard()

  run.recordIssues(loaded.issues)
  return {
    runCssModule,
    handleTokenChange
  }
  function handleTokenChange(tokenPath: string): string | null {
    run.reset()
    guard.reset()

    const { group, issues } = applyTokenChange({
      tokenPath,
      cache,
    })

    run.recordIssues(issues)

    if (!group.cssPath) {
      run.recordMissingModule(group.groupPath)
      // runDiagnostics(cache, run)
      return null
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
    assert.hasCssPath(group)
    const cssData = processModule({ root, group })

    run.recordCssData(group.groupPath, cssData)
    tracker.markProcessed(cssPath)

    handleCompletion()
  }

  function handleCompletion(): void {
    if (!tracker.hasFinished()) return
    if (!guard.canComplete()) return
    // run.recordTrackerResult(tracker.getTrackerState or getTrackerResult())

    if (tracker.hasSucceeded()) {
      const emitResult = emitFiles(cache, run)
      run.recordEmitResult(emitResult)

    }

    runDiagnostics(cache, run)
  }
}