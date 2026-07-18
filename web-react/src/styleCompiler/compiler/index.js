import postcss from 'postcss';
import loadTokens from "./loadTokens.js"
import buildVarDefinitions from './buildVarDefinitions.js';
import buildCascade from './buildCascade.js';
import log from './consoleLog.js'
import resolveSelector from './resolveSelector.js';
import resolveFile from './resolveFile.js';
import reporter from './tokenReport.js';
import buildPresetFile from './buildPresetFile.js';
import buildComponentFile from './buildComponentFile.js';

const plugin = (opts = {}) => {
  const tokensDir = opts.tokensDir || "./src/styleCompiler/tokens";

  const components = loadTokens(tokensDir);
  buildComponentFile(components)
  log.jsonsLoaded(components)
  reporter.expectComponents(components)
  return {
    postcssPlugin: "design-tokens-plugin",

    Once(root, { result }) {
      const file = result.opts.from;

      for (const component of components) {

        const fileResult = resolveFile(file, component)
        if (!fileResult) {
          continue
        }

        reporter.foundComponent(component.name)

        const selectorResult = resolveSelector(root, component)
        const { selector, validSelectors, invalidSelectors, rule } = selectorResult

        buildPresetFile({ name: component.name, file: fileResult, selectors: validSelectors })
        reporter.presets({ name: component.name, infix: component.infix })

        if (invalidSelectors.length) {
          reporter.brokenSelectors({ file: fileResult, invalidSelectors })
        }

        if (!rule) {
          reporter.missingClass({ selector, file, validSelectors });
          continue
        }
        reporter.injected({ file: fileResult, selector });

        log.injecting(file)
        log.processing(component.name)
        log.buildingChains(component.infix)

        for (const variable of component.vars) {
          buildVarDefinitions(rule, component, variable);
          buildCascade(rule, component, variable);

          log.resultCascade(component, variable)
        }
      }
    }
  }
};

plugin.postcss = true;

export default plugin