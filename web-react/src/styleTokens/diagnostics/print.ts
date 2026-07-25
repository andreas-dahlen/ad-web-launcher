import { isValidPrefix, prefixPriority } from '../../shared/tokenUtils/prefixes.ts'
import formatLogPath from './formatLogPath.ts';

type Token = {
  name: string;
  alwaysAllowed: string[];
};

type Variable = {
  key: string;
  allowed: string[];
  values: Record<string, string>;
};

export type Print = {
  jsonsLoaded(tokens: Token[]): void;
  injecting(file: string): void;
  processing(name: string): void;
  buildingChains(infix: string): void;
  resultCascade(token: Token, variable: Variable): void;
  injected(target: { file: string; selector: string }): void;
  presets(data: { name: string; infix: string }): void;
  variableWarning(data: { name: string; unused: string[]; missing: string[]; infix: string; }): void;
  selectorWarning(data: { invalidSelectors: string[]; file: string; }): void;
  selectorError(data: { selector: string; validSelectors: string[]; file: string; }): void;
  missingFile(file: string): void;
};

const print: Print = {
  jsonsLoaded(tokens) { console.log("📦 Loaded json files:", tokens.map(c => c.name)) },

  injecting(file) { console.log("\n⚙️ Injecting into:", formatLogPath(file)) },
  processing(name) { console.log(`🎨 Processing token: ${name}`) },
  buildingChains(infix) { console.log(`\n🔧 chaining --final-${infix}-*`) },

  resultCascade(token, variable) {
    const chain = prefixPriority
      .filter(p => token.alwaysAllowed.includes(p) || variable.allowed.includes(p))
      .map(prefix => {
        const val = variable.values[prefix];
        if (!val) return prefix;
        if (!isValidPrefix(val)) {
          return `${prefix}:${val}`; // literal
        }
        return `${prefix}:${val}`; // prefix mapping
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

  variableWarning(variableData) {
    const { name, unused, missing, infix } = variableData
    console.log(`  🚮 Component: ${name}-${infix}`)
    if (unused.length > 0) {
      console.log(`     🎨 Unused in CSS (${unused.length}) ${unused.map(s => `${s}`).join(" , ")}`)
    }
    if (unused.length > 0 && missing.length > 0) {
      console.log()
    }
    if (missing.length > 0) {
      console.log(`     📦 Missing in JSON (${missing.length}) ${missing.map(s => `${s}`).join(" , ")}`)
    }
    console.log()
  },

  selectorWarning(warningData) {
    const { invalidSelectors, tokenPath } = warningData
    console.log(`     🚮 File: ${formatLogPath(tokenPath)}
        Selectors: ${invalidSelectors.map(s => `${s}`).join(" , ")}\n`)
  },

  selectorError(selectorData) {
    const { selector, validSelectors, file } = selectorData;

    console.warn(
      `    ❌ Expected: ${selector}
       File: ${formatLogPath(file)}
       Found: ${validSelectors.join(" | ")}
      ─────────────────────────────────────────────────────`
    );
  },

  missingFile(file) {
    console.log(`    ❌ ${file}.module.css`);
  },
}

export default print