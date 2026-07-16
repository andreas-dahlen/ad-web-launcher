import { constants } from '../../shared/compilerUtils/constants.js';
import path from "path";

const log = {
  jsonsLoaded(components) { console.log("📦 Loaded json files:", components.map(c => c.name)) },

  injecting(file) { console.log("\n⚙️ Injecting into:", this.formatLoggingPath(file)) },
  processing(name) { console.log(`🎨 Processing component: ${name}`) },
  buildingChains(infix) { console.log(`\n🔧 chaining --final-${infix}-*`) },

  // targetMissing(selector) {
  //   console.log(`\n❌ Created CSS class because couldn't find one named: ${selector}`)
  // },

  resultCascade(component, variable) {
    const chain = constants.prefixPriority
      .filter(p => component.alwaysAllowed.includes(p) || variable.allowed.includes(p))
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

  // addedTarget(file, selector) {
  //   console.log(`   ✅ Added: ${this.formatLoggingPath(file)}, ${selector}`);
  // },

  injectedTargets(target) {
    console.log(`   ✅ ${this.formatLoggingPath(target.file)} → ${target.selector}`)
  },


  missingFile(file) {
    console.log(`   ❌ ${file}.module.css`)
  },

  selectorWarning(selectorData) {
    const { selector, availableSelectors, file } = selectorData

    console.warn(
      `   ❌ ${selector}
          File: ${this.formatLoggingPath(file)}
          Available:
          ${availableSelectors.map(s => `${s}`).join(" | ")}
─────────────────────────────────────────────────────`
    );
  },

  tokenReport() {





  },









  formatLoggingPath(file) {
    return path.relative(process.cwd(), file)
      .split(path.sep)
      .slice(-2)
      .join("/");
  }
};

let timer;
export default log;
