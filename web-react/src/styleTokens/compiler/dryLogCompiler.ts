import fs from 'node:fs';
import postcss from 'postcss';
import type { Root } from 'postcss';
import path from 'node:path';
import { findTokenPaths } from './discovery/findTokenPaths.ts';
import { compileTokenGroups } from './pipeline/compileTokenGroups.ts';
import { createTokenCache } from './tracking/tokenCache.ts';
import { createCompilerRun } from './tracking/compilerRun.ts';
import { assert } from './processing/assertions.ts'
import { runDiagnostics } from '../diagnostics/runDiagnostics.ts';
import { processModule } from '../postCss/processModule.ts';

function dryLogCompiler() {
  const projectRoot = process.cwd();

  const tokensDir = path.join(projectRoot, "src/styleTokens/tokens");

  const tokenPaths = findTokenPaths(tokensDir)
  const loaded = compileTokenGroups(tokenPaths)
  const cache = createTokenCache(loaded.groups)
  const run = createCompilerRun(cache.getMissingCssGroupPaths())
  run.recordIssues(loaded.issues)

  for (const cssPath of cache.getCssPaths()) {
    const root = parseCss(cssPath)
    const group = cache.getGroupByCssPath(cssPath)

    //TODO NEEDS POST PARSING

    if (!group) {
      run.recordUnusedModule(cssPath);
      continue
    }
    assert.hasCssPath(group)
    const cssData = processModule({ root, group, mutate: false })

    cache.addCssData(cssData)
  }
  runDiagnostics(cache, run)

  function parseCss(cssPath: string): Root {
    const source = fs.readFileSync(cssPath, "utf8");
    return postcss.parse(source, { from: cssPath });
  }
}

dryLogCompiler()