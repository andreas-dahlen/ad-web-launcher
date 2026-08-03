import type { Root } from "postcss";
import type { CssData, CssTokenGroup, ProcessedToken } from '../types/compiler.types.ts';
import { print } from '../consoleUtils/print.ts';
import { walkModule } from './resolvers/walkModule.ts';
import { injectVarDefinitions } from './inject/injectVarDefinitions.ts';
import { injectCascade } from './inject/injectCascade.ts';

export function processModule({
  root,
  group,
}: {
  root: Root;
  group: CssTokenGroup;
}): CssData {

  print.injecting(group.groupPath)


  const { rules, foundSelectors, usableSelectors, foundVariables, declaredVariables } = walkModule(
    root, group.tokens.map(token => token.infix)
  );


  const tokenResults: ProcessedToken[] = [];
  for (const token of group.tokens) {
    print.processing(token.name)

    const rule = rules.get(`.${token.infix}`);

    // diagnostics.recordSelectors({ cssPath: group.cssPath, token, foundSelectors, rule })

    tokenResults.push({
      name: token.name,
      infix: token.infix,
      tokenPath: token.tokenPath,
      processed: Boolean(rule),
    });

    // diagnostics.recordVariables({ root, token })
    if (!rule) {
      continue;
    }

    print.buildingChains(token.infix)

    for (const variable of token.vars) {
      injectVarDefinitions(rule, token, variable);
      injectCascade(rule, token, variable);

      print.resultCascade(variable)
    }
    // diagnostics.recordTokenProcessed(token.name, token.infix)
  }
  return {
    groupPath: group.groupPath,
    cssPath: group.cssPath,
    foundSelectors,
    usableSelectors,
    tokens: tokenResults,
    foundVariables: foundVariables,
    declaredVariables: declaredVariables
  }
}