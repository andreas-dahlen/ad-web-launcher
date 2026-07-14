import { constants } from '../../shared/compilerUtils/constants.ts';
const log = {
  injecting(file) {
    console.log("⚙️ Injecting compiler classes into:", file);
  },

  jsonsLoaded(components) {
    console.log("📦 Loaded json files:", components.map(c => c.name));
  },

  processing(name) {
    console.log(`\n🎨 Processing component: ${name}`);
  },

  buildingChains(infix) {
    console.log(`\n🔧 chaining --final-${infix}-*`)
  },

  classMissing(selector) {
    console.log(`\n❌ Created CSS class because couldn't find one named: ${selector}`)
  },

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

  addedCompiler(name) {
    console.log(`   ✅ Added compiler: .${name}Compiler`);
  },

  finalResult(array) {
    console.log(`\n✨ [DesignTokens] Injection complete!`);
    console.log(`🧱 Compiler classes generated:`);
    for (const c of array) {
      console.log(` 🔹  ${c}`);
    }
    console.log("")
  }
};

export default log;
