import type { UnusableSelector } from '../../../types/diagnostics.types.js';
import type { CssData } from '../../../types/compiler.types.js';

export function analyzeSelectors(
  cssData: CssData,
): UnusableSelector | undefined {
  const unusableSelectors = cssData.foundSelectors.filter(
    selector => !cssData.usableSelectors.includes(selector),
  );

  if (unusableSelectors.length === 0) {
    return;
  }

  return {
    cssPath: cssData.cssPath,
    unusableSelectors,
  };
}