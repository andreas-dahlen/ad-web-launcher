import { constants } from '../../../shared/compilerUtils/prefixes.ts';
import path from "path";

const log = {
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

let timer
export default log