import type { PluginCreator, Root } from "postcss";
import { initializeCompiler } from './compilerService.ts';
import reporter from './logging/tokenReport.ts'
import log from './logging/consoleLog.ts'
import resolveSelector from './resolvers/resolveSelector.ts';
import generatePresetFile from './generators/generatePresetFile.ts';
import resolveVariableUsage from './resolvers/resolveVariableUsage.ts';
import buildVarDefinitions from './builders/buildVarDefinitions.ts';
import buildCascade from './builders/buildCascade.ts';
import path from 'node:path';
type PluginOptions = {
  tokensDir?: string;
};

const plugin: PluginCreator<PluginOptions> = (opts = {}) => {
  //----------------------------------------------------------
  // Discovery (plugin lifetime)
  //----------------------------------------------------------
  const dir = opts.tokensDir ?? "./src/styleTokens/tokens"//the or should be moved to constants from shared.. gather constants in one place...
  const compiler = initializeCompiler(dir);
  //----------------------------------------------------------
  // PostCSS
  //----------------------------------------------------------
  return {
    postcssPlugin: "design-tokens-plugin",

    Once(root: Root, { result }) {
      // refreshCache();
      const cssFile = result.opts.from;
      if (!cssFile) return;
      const group = compiler.cache.getGroupByCssPath(cssFile);
      console.log(path.resolve(cssFile))
      if (!group) return;

      for (const token of group.tokens) {

        reporter.foundToken(token.name)

        const selectorResult = resolveSelector(root, token)
        const { selector, validSelectors, invalidSelectors, rule } = selectorResult

        generatePresetFile({ name: token.name, file: group.cssPath, selectors: validSelectors })
        reporter.presets({ name: token.name, infix: token.infix })

        if (invalidSelectors.length > 0) {
          reporter.brokenSelectors({ file: group.cssPath, invalidSelectors })
        }

        if (!rule) {
          reporter.missingClass({ selector, file: group.groupPath, validSelectors });
          continue
        }
        reporter.injected({ file: group.cssPath, selector });

        const usage = resolveVariableUsage(root, token);

        if (usage.missing.length > 0 || usage.unused.length > 0) {
          reporter.mismatchedVariables({
            name: token.name,
            infix: token.infix,
            missing: usage.missing,
            unused: usage.unused
          });
        }

        log.injecting(group.groupPath)
        log.processing(token.name)
        log.buildingChains(token.infix)

        for (const variable of token.vars) {
          buildVarDefinitions(rule, token, variable);
          buildCascade(rule, token, variable);

          log.resultCascade(token, variable)
        }

      }
    }
  };
};

plugin.postcss = true;

export default plugin;