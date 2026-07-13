const postcss = require("postcss");
const loadTokens = require("./loadTokens.cjs");
const buildVarDefinitions = require("./buildVarDefinitions.cjs");
const constants = require("./constants.cjs");
const buildCascade = require('./buildCascade.cjs');
const log = require('./consoleLog.cjs')

module.exports = (opts = {}) => {
  const tokensDir = opts.tokensDir || "./src/styleCompiler/tokens";

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

        const selector = `.${component.name}Compiler`;

        let compilerRule

        root.walkRules(rule => {
          if (rule.selector === selector) {
            compilerRule = rule
          }
        })

        if (!compilerRule) {
          log.classMissing(selector)
          compilerRule = postcss.rule({ selector })
          root.append(compilerRule)
        }

        log.buildingChains(component.inFix)

        for (const variable of component.vars) {
          buildVarDefinitions(compilerRule, component, variable, constants);
          buildCascade(compilerRule, component, variable, constants);

          log.resultCascade(constants.prefixPriority, component, variable)
        }
        addedCompilers.push(`.${component.name}Compiler`);
        log.addedCompiler(component.name)
      }
      log.finalResult(addedCompilers)
    }
  };
};

module.exports.postcss = true;