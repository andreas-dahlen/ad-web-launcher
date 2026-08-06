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
import type { CssData, CssTokenGroup, ProcessedToken } from '../types/compiler.types.ts';
import { print } from '../consoleUtils/print.ts';
import { walkModule } from '../postCss/resolvers/walkModule.ts';

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

    if (!group) {
      run.recordUnusedModule(cssPath);
      continue
    }
    assert.hasCssPath(group)
    const cssData = dryProcessModule({ root, group })

    run.recordCssData(group.groupPath, cssData)
  }
  runDiagnostics(cache, run)

  //make sure it dies here! clear cache and stuff?

  //need css module and a loop ... probably decuple CSS writes...
  function parseCss(cssPath: string): Root {
    const source = fs.readFileSync(cssPath, "utf8");
    return postcss.parse(source, { from: cssPath });
  }
  function dryProcessModule({
    root,
    group,
  }: {
    root: Root;
    group: CssTokenGroup;
  }): CssData {

    print.injecting(group.groupPath)

    const { rules, foundSelectors, usableSelectors, foundFinalVariables, declaredVariables } = walkModule(
      root, group.tokens.map(token => token.infix)
    );

    const tokenResults: ProcessedToken[] = [];
    for (const token of group.tokens) {
      print.processing(token.name)

      const rule = rules.get(`.${token.infix}`);

      tokenResults.push({
        name: token.name,
        infix: token.infix,
        tokenPath: token.tokenPath,
        processed: Boolean(rule),
      });

      if (!rule) {
        continue;
      }

      print.buildingChains(token.infix)

      for (const variable of token.vars) {
        print.resultCascade(variable)
      }
    }
    return {
      groupPath: group.groupPath,
      cssPath: group.cssPath,
      foundSelectors,
      usableSelectors,
      tokens: tokenResults,
      foundFinalVariables: foundFinalVariables,
      declaredVariables
    }
  }
}

dryLogCompiler()