import type { Root } from 'postcss';
import { findTokenPaths } from './discovery/findTokenPaths.ts';
import { compileTokenGroups } from './pipeline/compileTokenGroups.ts';
import { applyTokenChange } from './pipeline/applyTokenChange.ts';
import { createTokenCache } from './tracking/tokenCache.ts';
import { createProcessingTracker } from './tracking/processingTracker.ts';
import { createCompilerRun } from './tracking/compilerRun.ts';
import { processPost } from '../postCss/processPost.ts';
import { processModule } from '../postCss/processModule.ts'
import { emitFiles } from '../emitters/emitFiles.ts';
import { runDiagnostics } from '../diagnostics/runDiagnostics.ts';
export type TokenCompiler = ReturnType<typeof initializeCompiler>;

export function initializeCompiler(tokensDir: string) {
  const tokenPaths = findTokenPaths(tokensDir)
  const loaded = compileTokenGroups(tokenPaths)
  const cache = createTokenCache(loaded.groups)
  const tracker = createProcessingTracker(cache.getCssPaths())
  const run = createCompilerRun()

  run.recordIssues(loaded.issues)

  return {
    handleCssModule,
    handleTokenChange
  }

  function handleTokenChange(tokenPath: string): string | null {

    const { group, issues } = applyTokenChange({
      tokenPath,
      cache,
    })

    if (!group.cssPath) return null
    run.recordIssues(issues)
    return group.cssPath //triggers handleCssModule
  }

  function handleCssModule(root: Root, cssPath: string): void {
    tracker.notifyPostCssActivity()
    const postData = processPost({ root, cssPath })
    cache.addPostData(postData)

    const group = cache.getGroupByCssPath(cssPath)
    if (!group) {

      void handleCompletion()
      return
    }

    tracker.invalidate(cssPath)

    const cssData = processModule({ root, group })
    cache.addCssData(cssData)

    tracker.markResolved(cssPath)
    run.recordProcessed(cssPath)

    void handleCompletion()
  }

  async function handleCompletion(): Promise<void> {
    await tracker.awaitPostCssCompletion();
    applyCompletion()
  }

  function applyCompletion(): void {
    const emitResult = emitFiles(cache, run)
    run.recordEmitResult(emitResult)
    runDiagnostics(cache, run)
    run.reset()
  }
}


