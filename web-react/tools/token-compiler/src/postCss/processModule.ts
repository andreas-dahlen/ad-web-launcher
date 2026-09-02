import type { Root } from "postcss";
import type { CssData, CssTokenGroup, ProcessedToken } from '../types/compiler.types.ts';
import { print } from '../utils/print.ts';
import { walkModule } from './resolvers/walkModule.ts';
import { injectVarDefinitions } from './inject/injectVarDefinitions.ts';
import { injectCascade } from './inject/injectCascade.ts';
import { injectPresetResets } from './inject/injectPresetResets.ts';

export function processModule({
  root,
  group,
  mute,
  mutate = true
}: {
  root: Root
  group: CssTokenGroup
  mute: boolean
  mutate?: boolean
}): CssData {

  if (!mute) { print.injecting(group.cssPath) }

  const { rules, foundSelectors, usableSelectors, foundFinalVariables, declaredVariables, presetResetData } = walkModule(
    root, group.tokens.map(token => token.infix)
  );

  const tokenResults: ProcessedToken[] = [];
  for (const token of group.tokens) {
    if (!mute) { print.processing(token.infix) }

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

    if (!mute) { print.buildingChains(token.infix) }

    for (const variable of token.vars) {
      if (!mute) { print.resultCascade(variable) }

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