import postcss from 'postcss';
import loadTokens from "./loadTokens.js"
import buildVarDefinitions from './builders//buildVarDefinitions.js';
import buildCascade from './builders/buildCascade.js';
import log from './logging/consoleLog.js'
import resolveSelector from './resolvers/resolveSelector.js';
import resolveCssModule from './resolvers/resolveCssModule.js';
import reporter from './logging/tokenReport.js';
import buildPresetFile from './generators/generatePreset.js';
import generateTokenStyles from './generators/generateTokenStyles.js';

const plugin = (opts = {}) => {
  const tokensDir = opts.tokensDir || "./src/styleCompiler/tokens";

  const tokens = loadTokens(tokensDir);
  generateTokenStyles(tokens)
  log.jsonsLoaded(tokens)
  reporter.expectTokens(tokens)
  return {
    postcssPlugin: "design-tokens-plugin",

    Once(root, { result }) {
      const file = result.opts.from;

      for (const token of tokens) {

        const cssModule = resolveCssModule(file, token)
        if (!cssModule) {
          continue
        }

        reporter.foundToken(token.name)

        const selectorResult = resolveSelector(root, token)
        const { selector, validSelectors, invalidSelectors, rule } = selectorResult

        buildPresetFile({ name: token.name, file: cssModule, selectors: validSelectors })
        reporter.presets({ name: token.name, infix: token.infix })

        if (invalidSelectors.length) {
          reporter.brokenSelectors({ file: cssModule, invalidSelectors })
        }

        if (!rule) {
          reporter.missingClass({ selector, file, validSelectors });
          continue
        }
        reporter.injected({ file: cssModule, selector });

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