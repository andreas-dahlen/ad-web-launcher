
import type { TokenCache } from "@styleTokens/compiler/state/tokenCache.ts";

import type log from "./log.ts";
import resolveVariableUsage from '@styleTokens/postCss/resolvers/resolveVariableUsage.ts';
import type { Root } from 'postcss';
import type { LoadedToken } from '@styleTokens/types/compiler.types.ts';

type InjectedTarget = Parameters<typeof log.injected>[0];
type PresetData = Parameters<typeof log.presets>[0];
type VariableData = Parameters<typeof log.variableWarning>[0];
type SelectorWarningData = Parameters<typeof log.selectorWarning>[0];
type SelectorErrorData = Parameters<typeof log.selectorError>[0];

type SelectorData = Parameters<typeof log.selectors>[0];

export type Diagnostics = ReturnType<typeof createDiagnosticLog>;

export default function createDiagnosticLog() {
  const state = {
    expectedGroups: new Set<string>(),
    expectedTokens: new Set<string>(),

    processedGroups: new Set<string>(),
    processedTokens: new Set<string>(),

    presets: new Set<PresetData>(),

    brokenSelectors: new Set<SelectorWarningData>(),
    missingClasses: new Set<SelectorErrorData>(),
    mismatchedVariables: new Set<VariableData>(),
  };

  return {
    resync,

    selectors,

    variables,

    processedToken,

    processedGroup,

    // // foundToken,

    // injected,
    // preset,

    // brokenSelectors,
    // missingClass,
    // mismatchedVariables,

    snapshot,
  };

  function resync(cache: TokenCache) {
    clear();

    for (const group of cache.groups()) {
      state.expectedGroups.add(group.groupPath);

      for (const token of group.tokens) {
        state.expectedTokens.add(token.name);
      }
    }
  }

  function selectors(data: SelectorData) {
    if (data.invalidSelectors.length > 0) {
      state.brokenSelectors.add({ tokenPath: data.token.tokenPath, brokenSelectors: data.selectorResult.invalidSelectors });
    }
    if (!data.selectorResult.rule) { //&& if no cssPath because if no CSS path we have a bigger issue?
      state.missingClasses.add({ infix: data.token.infix, tokenPath: data.token.tokenPath, selectors: data.selectors.validSelectors })
    }
  }

  function variables(data: { root: Root; token: LoadedToken }) {
    const { root, token } = data
    const usage = resolveVariableUsage(root, token)
    if (usage.missing.length > 0 || usage.unused.length > 0) {
      state.mismatchedVariables.add({
        name: token.name,
        infix: token.infix,
        missing: usage.missing,
        unused: usage.unused
      });
    }
  }

  function processedGroup(groupPath: string) {
    state.processedGroups.add(groupPath);
  }

  function processedToken(name: string) {
    state.processedTokens.add(name);
  }

  function snapshot() {
    return state;
  }

  function clear() {
    state.expectedGroups.clear();
    state.expectedTokens.clear();

    state.processedGroups.clear();
    state.processedTokens.clear();

    state.presets.clear();

    state.brokenSelectors.clear();
    state.missingClasses.clear();
    state.mismatchedVariables.clear();
  }
}