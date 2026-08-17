import type { Root } from 'postcss';
import { findTokenPaths } from './discovery/findTokenPaths.ts';
import { compileTokenGroups } from './pipeline/compileTokenGroups.ts';
import { applyTokenChange } from './pipeline/applyTokenChange.ts';
import { createTokenCache } from './tracking/tokenCache.ts';
import { createProcessingTracker } from './tracking/processingTracker.ts';
import { createCompilerRun } from './tracking/compilerRun.ts';
// import { createCompletionGuard } from './tracking/completionGuard.ts';
import { processPost } from '../postCss/processPost.ts';
import { processModule } from '../postCss/processModule.ts'
import { assert } from './processing/assertions.ts'
import { emitFiles } from '../emitters/emitFiles.ts';
import { runDiagnostics } from '../diagnostics/runDiagnostics.ts';
export type TokenCompiler = ReturnType<typeof initializeCompiler>;

export function initializeCompiler(tokensDir: string) {
  const tokenPaths = findTokenPaths(tokensDir)
  const loaded = compileTokenGroups(tokenPaths)
  const cache = createTokenCache(loaded.groups)
  const tracker = createProcessingTracker(cache.getCssPaths())
  const run = createCompilerRun(cache.getMissingCssGroupPaths())
  // const guard = createCompletionGuard()

  run.recordIssues(loaded.issues)
  return {
    runCssModule,
    handleTokenChange
  }

  function handleTokenChange(tokenPath: string): string | null {
    run.reset()
    // guard.reset()

    const { group, issues } = applyTokenChange({
      tokenPath,
      cache,
    })

    run.recordIssues(issues)

    if (!group.cssPath) {
      run.recordMissingModule(group.groupPath)
      return null
    }
    tracker.invalidate(group.cssPath)
    return group.cssPath //triggers runCssModule
  }

  function runCssModule(root: Root, cssPath: string): void {
    console.log("postCss ran:", cssPath)
    tracker.notifyPostCssActivity()

    const postData = processPost(root, cssPath)
    cache.addPostData(postData)

    const group = cache.getGroupByCssPath(cssPath)
    if (!group) {
      tracker.markMissing(cssPath)
      run.recordUnusedModule(cssPath);

      void handleCompletion()
      return
    }
    tracker.notifyPostCssActivity()
    assert.hasCssPath(group)

    const cssData = processModule({ root, group })

    cache.addCssData(cssData)
    tracker.markProcessed(cssPath)

    void handleCompletion()
  }

  async function handleCompletion(): Promise<void> {
    await tracker.awaitPostCssCompletion();

    console.log("before guard")

    // console.log("can complete:", guard.canComplete())
    // if (!guard.canComplete()) return
    if (tracker.tokensSucceeded()) {
      const emitResult = emitFiles(cache)
      run.recordEmitResult(emitResult)

    }

    runDiagnostics(cache, run)
  }
}