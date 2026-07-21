
import getTokens from "../loaders/getTokens.ts"
import getToken from '../loaders/getToken.ts';
import buildVarDefinitions from './builders/buildVarDefinitions.ts';
import buildCascade from './builders/buildCascade.ts';
import log from './logging/consoleLog.ts'
import resolveSelector from './resolvers/resolveSelector.ts';
import reporter from './logging/tokenReport.ts';
import generatePresetFile from './generators/generatePresetFile.ts';
import generateTokenStyles from './generators/generateTokenStyles.ts';
import resolveVariableUsage from './resolvers/resolveVariableUsage.ts';
import resolveCssTokenFile from './resolvers/resolveCssTokenFile.ts';
import type { Root, PluginCreator } from 'postcss';

type PluginOptions = {
  tokensDir?: string;
};

const plugin: PluginCreator<PluginOptions> = (opts: PluginOptions = {}) => {
  const tokensDir = opts.tokensDir || "./src/styleCompiler/tokens";
  const tokens = getTokens(tokensDir);
  generateTokenStyles(tokens)
  log.jsonsLoaded(tokens)
  reporter.expectTokens(tokens)

  return {
    postcssPlugin: "design-tokens-plugin",

    Once(root: Root, { result }) {
      const file = result.opts.from;
      if (!file) return;
      const freshTokens = tokens
        .map(token => {
          const cssModule = resolveCssTokenFile(file, token.name);

          if (!cssModule) {
            return null;
          }

          return {
            token: getToken(token.file),
            cssModule
          };
        })
        .filter(
          (
            token,
          ): token is {
            token: ReturnType<typeof getToken>;
            cssModule: string;
          } => token !== null,
        );

      for (const { token, cssModule } of freshTokens) {
        reporter.foundToken(token.name)

        const selectorResult = resolveSelector(root, token)
        const { selector, validSelectors, invalidSelectors, rule } = selectorResult

        generatePresetFile({ name: token.name, file: cssModule, selectors: validSelectors })
        reporter.presets({ name: token.name, infix: token.infix })

        if (invalidSelectors.length > 0) {
          reporter.brokenSelectors({ file: cssModule, invalidSelectors })
        }

        if (!rule) {
          reporter.missingClass({ selector, file, validSelectors });
          continue
        }
        reporter.injected({ file: cssModule, selector });

        const usage = resolveVariableUsage(root, token);

        if (usage.missing.length > 0 || usage.unused.length > 0) {
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