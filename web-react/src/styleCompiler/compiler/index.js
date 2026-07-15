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
      // TODO: compiler classes currently host cascades.
      // Future: inject cascades into consuming component classes.
      if (!file.endsWith("tokens.module.css")) return;
      //remove

      log.injecting(file) //move

      const components = loadTokens(tokensDir);
      log.jsonsLoaded(components)

      const addedCompilers = [];

      for (const component of components) {
        log.processing(component.name)

        //needs to be derived from tokens where to inject.
        const selector = `.${component.name}Compiler`;

        //needs to be a map?
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

        //needs to be pushed correctly..
        addedCompilers.push(`.${component.name}Compiler`);
        log.addedCompiler(component.name)
      }
      log.finalResult(addedCompilers)
    }
  };
};

plugin.postcss = true;

export default plugin