const postcss = require("postcss");
const loadTokens = require("./loadTokens.cjs");
const buildVarDefinitions = require("./buildVarDefinitions.cjs");
const constants = require("./constants.cjs");
const buildCascade = require('./buildCascade.cjs');
const log = require('./consoleLog.cjs')

module.exports = (opts = {}) => {
  const tokensDir = opts.tokensDir || "./src/shared/styleSystem/tokens";

  return {
    postcssPlugin: "design-tokens-plugin",

    Once(root, { result }) {
      const file = result.opts.from;

      if (!file.endsWith("tokens.module.css")) return;

      log.injecting(file)

      const components = loadTokens(tokensDir);
      log.jsonsLoaded(components)

      const addedCompilers = [];

      for (const component of components) {
        log.processing(component.name)
        const compilerRule = postcss.rule({
          selector: `.${component.name}Compiler`
        });

        for (const variable of component.vars) {
          // console.log(`          🔧 building -> ${variable.key}`);
          buildVarDefinitions(compilerRule, component, variable, constants);
          buildCascade(compilerRule, component, variable, constants);

          log.resultCascade(constants.prefixPriority, component, variable)
        }
        root.append(compilerRule);
        addedCompilers.push(`.${component.name}Compiler`);
        log.addedCompiler(component.name)
      }
      log.finalResult(addedCompilers)
    }
  };
};

module.exports.postcss = true;