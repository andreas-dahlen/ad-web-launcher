import type { CompilerVariable } from '../types/compiler.types.ts';
import { isValidPrefix } from '../../shared/tokenUtils/prefixes.ts'
import { colors, formatLogPath, paint } from './utils.ts';

type Print = {
  injecting(file: string): void;
  processing(name: string): void;
  buildingChains(infix: string): void;
  resultCascade(variable: CompilerVariable): void;
};

export const print: Print = {
  // jsonsLoaded(tokens) { console.log("📦 Loaded json files:", tokens.map(c => c.name)) },

  injecting(file) { console.log(`\n⚙️ ${paint(`Injecting into:`, colors.subHeading)} ${paint(formatLogPath(file), colors.file)}`) },
  processing(name) { console.log(`🎨 ${paint(`Processing token:`, colors.subHeading)} ${paint(name, colors.heading)}`) },
  buildingChains(infix) { console.log(`\n🔧 ${paint(`chaining`, colors.muted)} ${paint(`--final-${infix}-*`, colors.variable)}`) },

  resultCascade(variable) {
    const chain = variable.effectiveAllowed.map(prefix => {
      const value = variable.values[prefix];

      const prefixCol = `${paint(prefix, colors.symbol)}`

      if (!value) {
        return `${prefixCol}`;
      }

      const colValue = `${paint(value, colors.variable)}`

      if (isValidPrefix(value)) {
        return `${prefixCol}:${colValue}`;
      }

      return `${prefixCol}:${colValue}`;
    });

    console.log(`   🔮 ${paint(variable.key, colors.success)}: ${chain.join(" → ")}`);
  }
}