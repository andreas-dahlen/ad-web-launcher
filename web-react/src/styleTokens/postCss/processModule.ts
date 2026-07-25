import type { Root } from "postcss";
import print from '../diagnostics/report/print.ts';
import resolveSelectors from './resolvers/resolveSelectors.ts';
import buildVarDefinitions from './builders/buildVarDefinitions.ts';
import buildCascade from './builders/buildCascade.ts';
import type { CssData, TokenGroup, TokenResult } from '../types/compiler.types.ts';

export default function processModule({
  root,
  group,
}: {
  root: Root;
  group: TokenGroup;
}): CssData {

  print.injecting(group.groupPath)

  const { rules, foundSelectors } = resolveSelectors(
    root,
    group.tokens.map(token => token.infix)
  );


  const tokenResults: TokenResult[] = [];
  for (const token of group.tokens) {
    print.processing(token.name)

    const rule = rules.get(`.${token.infix}`);

    // diagnostics.recordSelectors({ cssPath: group.cssPath, token, foundSelectors, rule })

    tokenResults.push({
      name: token.name,
      infix: token.infix,
      processed: Boolean(rule),
    });

    // diagnostics.recordVariables({ root, token })
    if (!rule) {
      continue;
    }

    print.buildingChains(token.infix)

    for (const variable of token.vars) {
      buildVarDefinitions(rule, token, variable);
      buildCascade(rule, token, variable);

      print.resultCascade(token, variable)
    }
    // diagnostics.recordTokenProcessed(token.name, token.infix)
  }
  return {
    groupPath: group.groupPath,
    cssPath: group.cssPath,
    foundSelectors,
    tokens: tokenResults
  }
}