import postcss from 'postcss';
import loadTokens from "./loadTokens.js"
import buildVarDefinitions from './builders//buildVarDefinitions.js';
import buildCascade from './builders/buildCascade.js';
import log from './logging/consoleLog.js'
import resolveSelector from './resolvers/resolveSelector.js';
import reporter from './logging/tokenReport.js';
import generatePresetFile from './generators/generatePresetFile.js';
import generateTokenStyles from './generators/generateTokenStyles.js';
import resolveVariableUsage from './resolvers/resolveVariableUsage.js';
import resolveCssTokenFile from './resolvers/resolveCssTokenFile.js';

const plugin = (opts = {}) => {
  const tokensDir = opts.tokensDir || "./src/styleCompiler/tokens";
  let tokens = loadTokens(tokensDir);
  generateTokenStyles(tokens)
  log.jsonsLoaded(tokens)
  reporter.expectTokens(tokens)

  return {
    postcssPlugin: "design-tokens-plugin",

    Once(root, { result }) {
      tokens = loadTokens(tokensDir);

      const file = result.opts.from;
      for (const token of tokens) {

        const cssModule = resolveCssTokenFile(file, token)
        if (!cssModule) {
          continue
        }
        reporter.foundToken(token.name)

        const selectorResult = resolveSelector(root, token)
        const { selector, validSelectors, invalidSelectors, rule } = selectorResult

        generatePresetFile({ name: token.name, file: cssModule, selectors: validSelectors })
        reporter.presets({ name: token.name, infix: token.infix })

        if (invalidSelectors.length) {
          reporter.brokenSelectors({ file: cssModule, invalidSelectors })
        }

        if (!rule) {
          reporter.missingClass({ selector, file, validSelectors });
          continue
        }
        reporter.injected({ file: cssModule, selector });

        const usage = resolveVariableUsage(root, token);

        if (usage.missing.length || usage.unused.length) {
          reporter.mismatchedVariables({
            name: token.name,
            infix: token.infix,
            missing: usage.missing,
            unused: usage.unused
          });
        }

        log.injecting(file)
        log.processing(token.name)
        log.buildingChains(token.infix)

        for (const variable of token.vars) {
          buildVarDefinitions(rule, token, variable);
          buildCascade(rule, token, variable);

          log.resultCascade(token, variable)
        }
      }
    }
  }
};

plugin.postcss = true;

export default plugin