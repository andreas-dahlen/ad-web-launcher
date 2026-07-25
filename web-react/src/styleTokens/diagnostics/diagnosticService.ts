
import type { TokenCache } from "../compiler/state/tokenCache.ts";
import analyzeVariableUsage from './analyzers/analyzeVariableUsage.ts';
import type { Root, Rule } from 'postcss';
import type { CssData, LoadedToken } from '../types/compiler.types.ts';
import analyzeSelectors from './analyzers/analyzeSelectors.ts';

type SelectorCheckData = {
  cssPath: string | undefined
  token: LoadedToken
  foundSelectors: string[]
  rule: Rule | undefined
}

type VariableCheckData = {
  root: Root
  token: LoadedToken
}

type UnusableSelectors = {
  cssPath: string | undefined;
  unusableSelectors: string[];
};

type VariableMismatch = {
  name: string;
  infix: string;
  missing: string[];
  unused: string[];
};

type MissingClass = {
  infix: string;
  tokenPath: string;
  usableSelectors: string[];
};

export type DiagnosticSnapshot = ReturnType<Diagnostics["snapshot"]>;

export type Diagnostics = ReturnType<typeof createDiagnosticService>;

export default function createDiagnosticService() {

  const state = {
    expectedGroups: new Set<string>(),
    expectedTokens: new Set<string>(),

    processedGroups: new Set<string>(),
    processedTokens: new Set<string>(),

    //processedCssPaths new Set<string>(),

    // presets: new Set<PresetData>(),

    unusableSelectors: new Set<UnusableSelectors>(),
    missingClasses: new Set<MissingClass>(),
    mismatchedVariables: new Set<VariableMismatch>(),
  };
  return {
    reset,

    recordSelectors,

    recordVariables,

    recordTokenProcessed,

    recordGroupProcessed,

    snapshot,
  };

  function reset() {
    clear();
  }

  function recordCssData(cssData: CssData) {
    const { usableSelectors, unusableSelectors } = analyzeSelectors(cssData.foundSelectors)
  }

  function recordSelectors(data: SelectorCheckData) {
    const { usableSelectors, unusableSelectors } = analyzeSelectors(data.foundSelectors)
    if (unusableSelectors.length > 0) {
      state.unusableSelectors.add({
        cssPath: data.cssPath,
        unusableSelectors
      });
    }
    if (!data.rule) {
      state.missingClasses.add({
        infix: data.token.infix,
        tokenPath: data.token.tokenPath,
        usableSelectors
      })
    }
  }

  function recordVariables(data: VariableCheckData) {
    const { root, token } = data
    const usage = analyzeVariableUsage(root, token)
    if (usage.missing.length > 0 || usage.unused.length > 0) {
      state.mismatchedVariables.add({
        name: token.name,
        infix: token.infix,
        missing: usage.missing,
        unused: usage.unused
      });
    }
  }

  function recordGroupProcessed(groupPath: string) {
    state.processedGroups.add(groupPath);
  }

  function recordTokenProcessed(name: string, infix: string) {
    state.processedTokens.add(`${name}-${infix}`);
  }

  function snapshot() {
    return {
      expectedGroups: new Set(state.expectedGroups),
      expectedTokens: new Set(state.expectedTokens),

      processedGroups: new Set(state.processedGroups),
      processedTokens: new Set(state.processedTokens),

      // presets: new Set(state.presets),

      unusableSelectors: new Set(state.unusableSelectors),
      missingClasses: new Set(state.missingClasses),
      mismatchedVariables: new Set(state.mismatchedVariables),
    }
  }

  function clear() {
    state.expectedGroups.clear();
    state.expectedTokens.clear();

    state.processedGroups.clear();
    state.processedTokens.clear();

    // state.presets.clear();

    state.unusableSelectors.clear();
    state.missingClasses.clear();
    state.mismatchedVariables.clear();
  }
}