import type { Root } from "postcss";
import type { CssData, CssTokenGroup, ProcessedToken } from '../types/compiler.types.ts';
import { print } from '../consoleUtils/print.ts';
import { walkModule } from './resolvers/walkModule.ts';
import { injectVarDefinitions } from './inject/injectVarDefinitions.ts';
import { injectCascade } from './inject/injectCascade.ts';
import { injectPresetResets } from './inject/injectPresetResets.ts';

export function processModule({
  root,
  group,
  mutate = true
}: {
  root: Root;
  group: CssTokenGroup;
  mutate?: boolean
}): CssData {

  print.injecting(group.groupPath)

  const { rules, foundSelectors, usableSelectors, foundFinalVariables, declaredVariables, presetResetData } = walkModule(
    root, group.tokens.map(token => token.infix)
  );

  const tokenResults: ProcessedToken[] = [];
  for (const token of group.tokens) {
    print.processing(token.name)

    const rule = rules.get(`.${token.infix}`);

    tokenResults.push({
      name: token.name,
      infix: token.infix,
      tokenPath: token.tokenPath,
      processed: Boolean(rule),
    });

    if (!rule) {
      continue;
    }

    print.buildingChains(token.infix)

    for (const variable of token.vars) {
      print.resultCascade(variable)

      if (mutate) {
        injectVarDefinitions(rule, token, variable);
        injectCascade(rule, token, variable);
      }
    }
  }

  if (mutate) {
    injectPresetResets(presetResetData, group)
  }

  return {
    groupPath: group.groupPath,
    cssPath: group.cssPath,
    foundSelectors,
    usableSelectors,
    tokens: tokenResults,
    foundFinalVariables: foundFinalVariables,
    declaredVariables: declaredVariables
  }
}