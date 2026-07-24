import log from './log.ts'
type InjectedTarget = Parameters<typeof log.injected>[0];
type PresetData = Parameters<typeof log.presets>[0];
type VariableData = Parameters<typeof log.variableWarning>[0];
type SelectorWarningData = Parameters<typeof log.selectorWarning>[0];
type SelectorErrorData = Parameters<typeof log.selectorError>[0];

const state = {
  timer: undefined as ReturnType<typeof setTimeout> | undefined,
}


const injectedTargets = new Set<InjectedTarget>();
const missingClasses = new Set<SelectorErrorData>();

const foundTokens = new Set<string>();
const expectedTokens = new Set<string>();

const presets = new Set<PresetData>();
const brokenSelectors = new Set<SelectorWarningData>();

const mismatchedVariables = new Set<VariableData>();

function flush() {
  console.log(`\n ✨ [DesignTokens] Injection complete!`);
  console.log("────────────────────────────────────────")

  if (injectedTargets.size > 0) {
    console.log(`\n 🎯 Injected Cascade (${injectedTargets.size})`);
    for (const target of injectedTargets) {
      log.injected(target)
    }
  }

  if (presets.size > 0) {
    console.log(`\n 📝 Presets generated (${presets.size})`)
    for (const preset of presets) {
      log.presets(preset)
    }
  }

  if (mismatchedVariables.size > 0) {
    console.log(`\n 🧐 Mismatched CSS variables (${mismatchedVariables.size})`)
    for (const variableData of mismatchedVariables) {
      log.variableWarning(variableData)
    }
  }


  if (brokenSelectors.size > 0) {
    console.log(`\n 🙊 Unusable preset selectors (${brokenSelectors.size})`)
    for (const selector of brokenSelectors) {
      log.selectorWarning(selector)
    }
  }

  if (missingClasses.size > 0) {
    console.log(`\n 🧩  Missing css classes for injection (${missingClasses.size})`);
    for (const selector of missingClasses) {
      log.selectorError(selector)
    }
  }

  // eslint-disable-next-line unicorn/prefer-set-methods
  const missing = [...expectedTokens]
    .filter(name => !foundTokens.has(name));

  if (missing.length > 0) {
    console.log(`\n 📁 Missing Files (${missing.length})`);
    for (const name of missing)
      log.missingFile(name)
  }




  injectedTargets.clear();
  missingClasses.clear();
  expectedTokens.clear();
  foundTokens.clear();
  presets.clear();
  brokenSelectors.clear();
  mismatchedVariables.clear();
}

function scheduleFlush() {
  clearTimeout(state.timer);
  state.timer = setTimeout(flush, 500);
}

export default {
  expectTokens(tokens: { name: string }[]) {
    expectedTokens.clear();

    for (const token of tokens) {
      expectedTokens.add(token.name);
    }
  },
  foundToken(token: string) {
    foundTokens.add(token);
    scheduleFlush();
  },
  presets(presetData: PresetData) {
    presets.add(presetData);
    scheduleFlush();
  },
  brokenSelectors(brokenData: SelectorWarningData) {
    brokenSelectors.add(brokenData)
    scheduleFlush()
  },
  missingClass(selectorData: SelectorErrorData) {
    missingClasses.add(selectorData);
    scheduleFlush();
  },
  injected(target: InjectedTarget) {
    injectedTargets.add(target);
    scheduleFlush();
  },
  mismatchedVariables(variableData: VariableData) {
    mismatchedVariables.add(variableData)
    scheduleFlush();
  },
  clear() {
    injectedTargets.clear();
    missingClasses.clear();
    expectedTokens.clear();
    foundTokens.clear();
    presets.clear();
    brokenSelectors.clear();
    mismatchedVariables.clear();
  }
};