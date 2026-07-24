import type { Root } from "postcss";
import reporter from '../diagnostics/report.ts';
import print from '../diagnostics/print.ts';
import resolveSelector from './resolvers/resolveSelector.ts';
import resolveVariableUsage from './resolvers/resolveVariableUsage.ts';
import buildVarDefinitions from './builders/buildVarDefinitions.ts';
import buildCascade from './builders/buildCascade.ts';
import type { TokenGroup } from '../types/compiler.types.ts';
import type { Diagnostics } from '../diagnostics/createDiagnostics.ts';

export default function processCssFile({
  root,
  group,
  log
}: {
  root: Root;
  group: TokenGroup;
  log: Diagnostics
}) {
  print.injecting(group.groupPath)

  for (const token of group.tokens) {
    print.processing(token.name)

    const selectorResult = resolveSelector(root, token)
    // const { selector, validSelectors, invalidSelectors, rule } = selectorResult
    const { rule } = selectorResult

    log.selectors({ group, token, selectorResult })

    // generatePresetFile({ name: token.name, file: group.cssPath, selectors: validSelectors })
    // log.preset({ name: token.name, infix: token.infix })

    // if (invalidSelectors.length > 0) {
    //   log.brokenSelectors({ file: group.cssPath, invalidSelectors })
    // }

    if (!rule) {
      // log.missingClass({ selector, file: group.groupPath, validSelectors });
      continue
    }

    // const usage = resolveVariableUsage(root, token);

    // log.mismatchedVariables(resolveVariableUsage(root, token))

    log.variables({ root, token })

    // if (usage.missing.length > 0 || usage.unused.length > 0) {
    //   log.mismatchedVariables({
    //     name: token.name,
    //     infix: token.infix,
    //     missing: usage.missing,
    //     unused: usage.unused
    //   });
    // }

    print.buildingChains(token.infix)

    for (const variable of token.vars) {
      buildVarDefinitions(rule, token, variable);
      buildCascade(rule, token, variable);

      print.resultCascade(token, variable)
    }
    log.processedToken(token.name)
  }
  log.processedGroup(group.groupPath)
}