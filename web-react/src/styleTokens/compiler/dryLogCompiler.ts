import fs from 'node:fs';
import postcss from 'postcss';
import type { Root } from 'postcss';
import path from 'node:path';
import { findTokenPaths } from './discovery/findTokenPaths.ts';
import { compileTokenGroups } from './pipeline/compileTokenGroups.ts';
import { createTokenCache } from './tracking/tokenCache.ts';
import { createCompilerRun } from './tracking/compilerRun.ts';
import { runDiagnostics } from '../diagnostics/runDiagnostics.ts';
import { processModule } from '../postCss/processModule.ts';
import { processPost } from '../postCss/processPost.ts';

function dryLogCompiler() {
  const projectRoot = process.cwd();

  const tokensDir = path.join(projectRoot, "src/styleTokens/tokens");

  const tokenPaths = findTokenPaths(tokensDir)
  const loaded = compileTokenGroups(tokenPaths)
  const dryCache = createTokenCache(loaded.groups)
  const run = createCompilerRun()
  run.recordIssues(loaded.issues)

  for (const cssPath of dryCache.getCssPaths()) {
    const root = parseCss(cssPath)
    const group = dryCache.getGroupByCssPath(cssPath)

    const postData = processPost({ root, cssPath, mutate: false })
    dryCache.addPostData(postData)

    if (!group) continue

    const cssData = processModule({ root, group, mutate: false })
    dryCache.addCssData(cssData)

    run.recordProcessed(cssPath)
  }
  runDiagnostics(dryCache, run)

  run.reset()

  function parseCss(cssPath: string): Root {
    const source = fs.readFileSync(cssPath, "utf8");
    return postcss.parse(source, { from: cssPath });
  }
}

dryLogCompiler()