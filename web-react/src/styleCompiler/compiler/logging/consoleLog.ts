import { constants } from "../../../shared/compilerUtils/prefixes.ts";
import path from "node:path";

type Token = {
  name: string;
  alwaysAllowed: string[];
};

type Variable = {
  key: string;
  allowed: string[];
  values: Record<string, string>;
};

type Log = {
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
  formatLoggingPath(file: string): string;
};

const log: Log = {
  jsonsLoaded(tokens) { console.log("📦 Loaded json files:", tokens.map(c => c.name)) },

  injecting(file) { console.log("\n⚙️ Injecting into:", this.formatLoggingPath(file)) },
  processing(name) { console.log(`🎨 Processing token: ${name}`) },
  buildingChains(infix) { console.log(`\n🔧 chaining --final-${infix}-*`) },

  resultCascade(token, variable) {
    const chain = constants.prefixPriority
      .filter(p => token.alwaysAllowed.includes(p) || variable.allowed.includes(p))
      .map(prefix => {
        const val = variable.values[prefix];
        if (!val) return prefix;
        if (!constants.prefixPriority.includes(val)) {
          return `${prefix}:${val}`; // literal
        }
        return `${prefix}:${val}`; // prefix mapping
      });
    console.log(`   🔮 ${variable.key}: ${chain.join(" → ")}`);
  },

  injected(target) {
    console.log(`   ✅ ${this.formatLoggingPath(target.file)} → ${target.selector}`)
  },
  presets(data) {
    const { name, infix } = data
    console.log(`   ✅ ${name} - ${infix} `)
  },

  variableWarning(variableData) {
    const { name, unused, missing, infix } = variableData
    console.log(`     🚮 Component: ${name}-${infix}`)
    if (unused.length > 0) {
      console.log(`🎨 Unused in CSS (${unused.length}) ${unused.map(s => `${s}`).join(" , ")}`)
    }
    if (missing.length > 0) {
      console.log(`📦 Missing in JSON (${missing.length}) ${missing.map(s => `${s}`).join(" , ")}`)
    }
    console.log()
  },

  selectorWarning(warningData) {
    const { invalidSelectors, file } = warningData
    console.log(`     🚮 File: ${this.formatLoggingPath(file)}
        Selectors: ${invalidSelectors.map(s => `${s}`).join(" , ")}\n`)
  },

  selectorError(selectorData) {
    const { selector, validSelectors, file } = selectorData

    console.warn(
      `    ❌ Expected: ${selector}
       File: ${this.formatLoggingPath(file)}
       Found: ${validSelectors.map(s => `${s}`).join(" | ")}
      ─────────────────────────────────────────────────────`
    );
  },

  missingFile(file) { console.log(`    ❌ ${file}.module.css`) },

  formatLoggingPath(file) {
    return path.relative(process.cwd(), file)
      .split(path.sep)
      .slice(-2)
      .join("/")
  }
}

export default log