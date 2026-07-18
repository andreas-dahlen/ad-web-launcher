import log from './consoleLog.js'
let timer

const injectedTargets = new Set();
const missingClasses = new Set();

const foundTokens = new Set()
const expectedTokens = new Set()

const presets = new Set()
const brokenSelectors = new Set()

function flush() {
  console.log(`\n ✨ [DesignTokens] Injection complete!`);
  console.log("────────────────────────────────────────")

  if (injectedTargets.size) {
    console.log(`\n 🎯 Injected Cascade (${injectedTargets.size})`);
    for (const target of injectedTargets) {
      log.injected(target)
    }
  }

  if (presets.size) {
    console.log(`\n 📝 Presets generated (${presets.size})`)
    for (const preset of presets) {
      log.presets(preset)
    }
  }

  if (brokenSelectors.size) {
    console.log(`\n 🙊 Unusable preset selectors (${brokenSelectors.size})`)
    for (const selector of brokenSelectors) {
      log.selectorWarning(selector)
    }
  }


  if (missingClasses.size) {
    console.log(`\n 🧩  Missing css classes for injection (${missingClasses.size})`);
    for (const selector of missingClasses) {
      log.selectorError(selector)
    }
  }

  const missing = [...expectedTokens]
    .filter(name => !foundTokens.has(name));

  if (missing.length) {
    console.log(`\n 📁 Missing Files (${missing.length})`);
    for (const name of missing)
      log.missingFile(name)
  }



  injectedTargets.clear();
  missingClasses.clear();
  expectedTokens.clear();
  foundTokens.clear();
  presets.clear();
}

function scheduleFlush() {
  clearTimeout(timer);
  timer = setTimeout(flush, 500);
}

export default {
  expectTokens(tokens) {
    expectedTokens.clear();

    for (const token of tokens) {
      expectedTokens.add(token.name);
    }
  },
  foundToken(token) {
    foundTokens.add(token);
    scheduleFlush();
  },
  presets(presetData) {
    presets.add(presetData);
    scheduleFlush();
  },
  brokenSelectors(brokenData) {
    brokenSelectors.add(brokenData)
    scheduleFlush()
  },
  missingClass(selectorData) {
    missingClasses.add(selectorData);
    scheduleFlush();
  },
  injected(target) {
    injectedTargets.add(target);
    scheduleFlush();
  }
};