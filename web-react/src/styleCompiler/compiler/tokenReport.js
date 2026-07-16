import log from './consoleLog.js'
let timer

const injectedTargets = new Set();
const missingClasses = new Set();

const foundComponents = new Set()
const expectedComponents = new Set()

function flush() {
  console.log(`\n✨ [DesignTokens] Injection complete!`);
  console.log("────────────────────────────────────────")


  if (missingClasses.size) {
    console.log(`\n⚠ missing css classes (${missingClasses.size})`);
    for (const selector of missingClasses) {
      log.selectorWarning(selector)
    }
  }


  const missing = [...expectedComponents]
    .filter(name => !foundComponents.has(name));

  if (missing.length) {
    console.log(`\n⚠ Missing Files (${missing.length})`);
    for (const name of missing)
      log.missingFile(name)
  }

  if (injectedTargets.size) {
    console.log(`\n🎯 injected (${injectedTargets.size})`);
    for (const target of injectedTargets) {
      log.injectedTargets(target)
    }
  }

  injectedTargets.clear();
  missingClasses.clear();
  expectedComponents.clear();
  foundComponents.clear();
}

function scheduleFlush() {
  clearTimeout(timer);
  timer = setTimeout(flush, 500);
}

export default {
  foundFile(component) {
    foundComponents.add(component);
    scheduleFlush();
  },

  injected(target) {
    injectedTargets.add(target);
    scheduleFlush();
  },

  expectComponents(components) {
    expectedComponents.clear();

    for (const component of components) {
      expectedComponents.add(component.name);
    }
    // scheduleFlush();
  },

  missingClass(selectorData) {
    missingClasses.add(selectorData);
    scheduleFlush();
  }
};