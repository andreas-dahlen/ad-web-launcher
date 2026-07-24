import type { Root } from "postcss";
import reporter from '../diagnostics/report.ts'
import log from '../diagnostics/log.ts';
import resolveSelector from './resolvers/resolveSelector.ts';
import resolveVariableUsage from './resolvers/resolveVariableUsage.ts';
import buildVarDefinitions from './builders/buildVarDefinitions.ts';
import buildCascade from './builders/buildCascade.ts';
import type { TokenGroup } from '../types/compiler.types.ts';

export default function processCssFile({
  root,
  group
}: {
  root: Root;
  group: TokenGroup
}) {
  for (const token of group.tokens) {

    reporter.foundToken(token.name)

    const selectorResult = resolveSelector(root, token)
    const { selector, validSelectors, invalidSelectors, rule } = selectorResult

    // generatePresetFile({ name: token.name, file: group.cssPath, selectors: validSelectors })
    reporter.presets({ name: token.name, infix: token.infix })

    if (invalidSelectors.length > 0) {
      reporter.brokenSelectors({ file: group.cssPath, invalidSelectors })
    }

    if (!rule) {
      reporter.missingClass({ selector, file: group.groupPath, validSelectors });
      continue
    }
    reporter.injected({ file: group.cssPath, selector });

    const usage = resolveVariableUsage(root, token);

    if (usage.missing.length > 0 || usage.unused.length > 0) {
      reporter.mismatchedVariables({
        name: token.name,
        infix: token.infix,
        missing: usage.missing,
        unused: usage.unused
      });
    }

    log.injecting(group.groupPath)
    log.processing(token.name)
    log.buildingChains(token.infix)

    for (const variable of token.vars) {
      buildVarDefinitions(rule, token, variable);
      buildCascade(rule, token, variable);

      log.resultCascade(token, variable)
    }

  }
}