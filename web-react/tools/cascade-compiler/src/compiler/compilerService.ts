import { readFileSync } from 'node:fs'
import postcss, { Root } from 'postcss';
import { findTokenPaths } from './discovery/findTokenPaths.ts';
import { compileTokenGroups } from './pipeline/compileTokenGroups.ts';
import { createTokenCache } from './tracking/tokenCache.ts';
import { createCompilerRun } from './tracking/compilerRun.ts';
import { applyTokenChange } from './pipeline/applyTokenChange.ts';
import { processPost } from '../postCss/processPost.ts';
import { processModule } from '../postCss/processModule.ts';
import { emitFiles } from '../emitters/emitFiles.ts';
import { runDiagnostics } from '../diagnostics/runDiagnostics.ts';
import type { CompilerConfig } from '../types/run.types.ts';
// import { buildPackage } from '../package/buildPackage.ts';

export type TokenCompiler = ReturnType<typeof initializeCompiler>;
export function initializeCompiler(config: CompilerConfig) {
  const tokenPaths = findTokenPaths(config.tokenPath)
  const loaded = compileTokenGroups(config.projectRoot, tokenPaths)
  const cache = createTokenCache(loaded.groups, config)
  const run = createCompilerRun(loaded.issues)

  if (config.internal.initialProcessing) {
    for (const cssPath of cache.getCssPaths()) {
      handleCssChange(cssPath)
    }
    finalize()
  }

  return {
    handleCssChange,
    handleTokenChange,
    finalize
  }
  function handleTokenChange(tokenPath: string) {
    const { group, issues } = applyTokenChange({
      tokenPath,
      cache
    })

    if (!group.cssPath) {
      return null
    }
    run.recordIssues(issues)

    handleCssChange(group.cssPath)
    return group.cssPath
  }

  function handleCssChange(
    cssPath: string,
    source = readFileSync(cssPath, 'utf8')): string {
    const root = postcss.parse(source, { from: cssPath })
    return processCss(cssPath, root)
  }

  function processCss(
    cssPath: string,
    root: Root
  ): string {

    const postData = processPost({
      root,
      cssPath,
      trace: config.logging.trace,
      mutate: config.internal.willEmitCss
    })
    cache.addPostData(postData)

    const group = cache.getGroupByCssPath(cssPath)
    if (!group) {
      return root.toString()
    }

    const cssData = processModule({
      root,
      group,
      trace: config.logging.trace,
      mutate: config.internal.willEmitCss
    })
    cache.addCssData(cssData)
    run.recordProcessed(cssPath)

    return root.toString()
  }



  function finalize(): void {
    if (config.generatedPath) {
      const emitResult = emitFiles(cache, run)
      run.recordEmitResult(emitResult)

    } else {
      console.log("EMITTER: disabled. No output path")
    }
    runDiagnostics(cache, run)
    run.reset()
  }
}