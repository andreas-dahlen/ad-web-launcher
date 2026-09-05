import type { Root } from 'postcss';
import { readFileSync } from 'node:fs'
import postcss from 'postcss';
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

function parseCss(cssPath: string): Root {
  const source = readFileSync(cssPath, "utf8");
  return postcss.parse(source, { from: cssPath });
}


export type TokenCompiler = ReturnType<typeof initializeCompiler>;
export function initializeCompiler(config: CompilerConfig) {

  console.log("COMPILER LOGGING SETTINGS:", config.logging)
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
      root, cssPath, trace: config.logging.trace
    })
    cache.addPostData(postData)

    const group = cache.getGroupByCssPath(cssPath)
    if (!group) return

    const cssData = processModule({
      root, group, trace: config.logging.trace
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
    runDiagnostics(cache, run)
    run.reset()
  }
}