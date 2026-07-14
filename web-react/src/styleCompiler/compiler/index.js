import postcss from 'postcss';
import loadTokens from "./loadTokens.js"
import buildVarDefinitions from './buildVarDefinitions.js';
import buildCascade from './buildCascade.js';
import log from './consoleLog.js'

const plugin = (opts = {}) => {
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

        log.buildingChains(component.infix)

        for (const variable of component.vars) {
          buildVarDefinitions(compilerRule, component, variable);
          buildCascade(compilerRule, component, variable);

          log.resultCascade(component, variable)
        }
        addedCompilers.push(`.${component.name}Compiler`);
        log.addedCompiler(component.name)
      }
      log.finalResult(addedCompilers)
    }
  };
};

plugin.postcss = true;

export default plugin