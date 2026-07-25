
import type { Diagnostics } from './diagnosticService.ts';
import print from './print.ts'

export default function createReporter(
  diagnostics: Diagnostics
) {
  let timer: ReturnType<typeof setTimeout> | undefined

  return {
    scheduleFlush,
    flush
  }

  function flush() {

    const snapshot = diagnostics.snapshot()
    console.log(`\n ✨ [DesignTokens] Injection complete!`);
    console.log("────────────────────────────────────────")

    // if (injectedTargets.size > 0) {
    //   console.log(`\n 🎯 Injected Cascade (${injectedTargets.size})`);
    //   for (const target of injectedTargets) {
    //     print.injected(target)
    //   }
    // }

    // if (presets.size > 0) {
    //   console.log(`\n 📝 Presets generated (${presets.size})`)
    //   for (const preset of presets) {
    //     print.presets(preset)
    //   }
    // }

    // if (mismatchedVariables.size > 0) {
    //   console.log(`\n 🧐 Mismatched CSS variables (${mismatchedVariables.size})`)
    //   for (const variableData of mismatchedVariables) {
    //     print.variableWarning(variableData)
    //   }
    // }


    // if (brokenSelectors.size > 0) {
    //   console.log(`\n 🙊 Unusable preset selectors (${brokenSelectors.size})`)
    //   for (const selector of brokenSelectors) {
    //     print.selectorWarning(selector)
    //   }
    // }

    // if (missingClasses.size > 0) {
    //   console.log(`\n 🧩  Missing css classes for injection (${missingClasses.size})`);
    //   for (const selector of missingClasses) {
    //     print.selectorError(selector)
    //   }
    // }

    // // eslint-disable-next-line unicorn/prefer-set-methods
    // const missing = [...expectedTokens]
    //   .filter(name => !foundTokens.has(name));

    // if (missing.length > 0) {
    //   console.log(`\n 📁 Missing Files (${missing.length})`);
    //   for (const name of missing)
    //     print.missingFile(name)
    // }


  }

  function scheduleFlush() {
    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = undefined;
      flush();
    }, 500);
  }
}