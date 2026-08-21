import type { Root } from 'postcss';
import { readFileSync } from 'node:fs'
import postcss from 'postcss';
import { findTokenPaths } from './discovery/findTokenPaths.js';
import { compileTokenGroups } from './pipeline/compileTokenGroups.js';
import { createTokenCache } from './tracking/tokenCache.js';
import { createCompilerRun } from './tracking/compilerRun.js';
import { applyTokenChange } from './pipeline/applyTokenChange.js';
import { processPost } from '../postCss/processPost.js';
import { processModule } from '../postCss/processModule.js';
import { emitFiles } from '../emitters/emitFiles.js';
import { runDiagnostics } from '../diagnostics/runDiagnostics.js';
import type { CompilerConfig } from '../run/run.js';

function parseCss(cssPath: string): Root {
  const source = readFileSync(cssPath, "utf8");
  return postcss.parse(source, { from: cssPath });
}


export type TokenCompiler = ReturnType<typeof initializeCompiler>;
export function initializeCompiler(config: CompilerConfig) {

  const tokenPaths = findTokenPaths(config.tokenPath)
  const loaded = compileTokenGroups(config.rootPath, tokenPaths)
  const cache = createTokenCache(loaded.groups, config)
  const run = createCompilerRun(loaded.issues)

  for (const cssPath of cache.getCssPaths()) {
    processCss(cssPath)
  }

  finalize()

  return {
    handleCssChange,
    handleTokenChange
  }

  function handleCssChange(filePath: string) {
    processCss(filePath)
    finalize()
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

    processCss(group.cssPath)
    finalize()
  }


  function processCss(cssPath: string) {

    const root = parseCss(cssPath)

    const postData = processPost({
      root, cssPath,// mutate: config.mutate
    })
    cache.addPostData(postData)

    const group = cache.getGroupByCssPath(cssPath)
    if (!group) return

    const cssData = processModule({
      root, group,// mutate: config.mutate
    })
    cache.addCssData(cssData)
    run.recordProcessed(cssPath)
  }



  function finalize(): void {
    const emitResult = emitFiles(cache, run)
    run.recordEmitResult(emitResult)
    runDiagnostics(cache, run)
    run.reset()
  }
}