import type { Root } from "postcss";
import print from '../diagnostics/report/print.ts';
import resolveSelector from './resolvers/resolveSelector.ts';
import buildVarDefinitions from './builders/buildVarDefinitions.ts';
import buildCascade from './builders/buildCascade.ts';
import type { TokenGroup } from '../types/compiler.types.ts';
import type { Diagnostics } from '../diagnostics/diagnosticService.ts';

export default function processCssFile({
  root,
  group,
}: {
  root: Root;
  group: TokenGroup;
}) {
  print.injecting(group.groupPath)

  for (const token of group.tokens) {
    print.processing(token.name)

    const { rule, foundSelectors } = resolveSelector(root, token.infix)

    // diagnostics.recordSelectors({ cssPath: group.cssPath, token, foundSelectors, rule })

    if (!rule) {
      continue
    }

    // diagnostics.recordVariables({ root, token })

    print.buildingChains(token.infix)

    for (const variable of token.vars) {
      buildVarDefinitions(rule, token, variable);
      buildCascade(rule, token, variable);

      print.resultCascade(token, variable)
    }
    // diagnostics.recordTokenProcessed(token.name, token.infix)
  }
  // diagnostics.recordGroupProcessed(group.groupPath)
}