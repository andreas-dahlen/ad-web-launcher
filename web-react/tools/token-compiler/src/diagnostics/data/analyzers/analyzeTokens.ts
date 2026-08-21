import type { MissingClass } from '../../../types/diagnostics.types.js';
import type { CssData } from '../../../types/compiler.types.js';

export function analyzeTokens(cssData: CssData): MissingClass[] {

  const missingClasses: MissingClass[] = [];

  for (const token of cssData.tokens) {
    if (!token.processed) {
      missingClasses.push({
        infix: token.infix,
        tokenPath: token.tokenPath,
        usableSelectors: cssData.usableSelectors
      });
    }
  }

  return missingClasses

}