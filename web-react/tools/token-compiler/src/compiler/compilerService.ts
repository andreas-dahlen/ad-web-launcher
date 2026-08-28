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
import type { CompilerConfig } from '../types/run.types.js';

function parseCss(cssPath: string): Root {
  const source = readFileSync(cssPath, "utf8");
  return postcss.parse(source, { from: cssPath });
}


export type TokenCompiler = ReturnType<typeof initializeCompiler>;
export function initializeCompiler(config: CompilerConfig) {

  const tokenPaths = findTokenPaths(config.tokenPath)
  const loaded = compileTokenGroups(config.rootDir, tokenPaths)
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
      root, cssPath, mute: config.mute
    })
    cache.addPostData(postData)

    const group = cache.getGroupByCssPath(cssPath)
    if (!group) return

    const cssData = processModule({
      root, group, mute: config.mute
    })
    cache.addCssData(cssData)
    run.recordProcessed(cssPath)
  }



  function finalize(): void {
    if (config.outPath) {
      const emitResult = emitFiles(cache, run)
      run.recordEmitResult(emitResult)
    } else {
      console.log("EMITTER: disabled. Couldn't find an output path")
    }
    if (!config.mute) {
      runDiagnostics(cache, run)
    }
    run.reset()
  }
}