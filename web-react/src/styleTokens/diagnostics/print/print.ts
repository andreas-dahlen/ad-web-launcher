import type { CompilerToken, CompilerVariable } from '../../types/compiler.types.ts';
import { isValidPrefix } from '../../../shared/tokenUtils/prefixes.ts'
import formatLogPath from './formatLogPath.ts';

export type Print = {
  jsonsLoaded(tokens: CompilerToken[]): void;
  injecting(file: string): void;
  processing(name: string): void;
  buildingChains(infix: string): void;
  resultCascade(variable: CompilerVariable): void;
  injected(target: { file: string; selector: string }): void;
  presets(data: { name: string; infix: string }): void;
  // variableWarning(data: { name: string; unused: string[]; missing: string[]; infix: string; }): void;
  // selectorWarning(data: { invalidSelectors: string[]; file: string; }): void;
  // selectorError(data: { selector: string; validSelectors: string[]; file: string; }): void;
  // missingFile(file: string): void;
  // section(section: ReportSection): void;
};

const print: Print = {
  jsonsLoaded(tokens) { console.log("📦 Loaded json files:", tokens.map(c => c.name)) },

  injecting(file) { console.log("\n⚙️ Injecting into:", formatLogPath(file)) },
  processing(name) { console.log(`🎨 Processing token: ${name}`) },
  buildingChains(infix) { console.log(`\n🔧 chaining --final-${infix}-*`) },

  resultCascade(variable) {
    const chain = variable.effectiveAllowed.map(prefix => {
      const value = variable.values[prefix];

      if (!value) {
        return prefix;
      }

      if (isValidPrefix(value)) {
        return `${prefix}:→${value}`;
      }

      return `${prefix}:${value}`;
    });

    console.log(`   🔮 ${variable.key}: ${chain.join(" → ")}`);
  },

  injected(target) {
    console.log(`   ✅ ${formatLogPath(target.file)} → ${target.selector}`)
  },
  presets(data) {
    const { name, infix } = data
    console.log(`   ✅ ${name} - ${infix} `)
  },

  // variableWarning(variableData) {
  //   const { name, unused, missing, infix } = variableData
  //   console.log(`  🚮 Component: ${name}-${infix}`)
  //   if (unused.length > 0) {
  //     console.log(`     🎨 Unused in CSS (${unused.length}) ${unused.map(s => `${s}`).join(" , ")}`)
  //   }
  //   if (unused.length > 0 && missing.length > 0) {
  //     console.log()
  //   }
  //   if (missing.length > 0) {
  //     console.log(`     📦 Missing in JSON (${missing.length}) ${missing.map(s => `${s}`).join(" , ")}`)
  //   }
  //   console.log()
  // },

  // selectorWarning(warningData) {
  //   const { invalidSelectors, tokenPath } = warningData
  //   console.log(`     🚮 File: ${formatLogPath(tokenPath)}
  //       Selectors: ${invalidSelectors.map(s => `${s}`).join(" , ")}\n`)
  // },

  // selectorError(selectorData) {
  //   const { selector, validSelectors, file } = selectorData;

  //   console.warn(
  //     `    ❌ Expected: ${selector}
  //      File: ${formatLogPath(file)}
  //      Found: ${validSelectors.join(" | ")}
  //     ─────────────────────────────────────────────────────`
  //   );
  // },

  // missingFile(file) {
  //   console.log(`    ❌ ${file}.module.css`);
  // },


  // section(section: ReportSection) {
  //   console.log(`\n ${section.title}`);

  //   for (const entry of section.entries) {
  //     console.log(`  ${entry.title}`);

  //     for (const line of entry.lines) {
  //       console.log(`     ${line}`);
  //     }

  //     console.log();
  //   }
  // }
}

export default print