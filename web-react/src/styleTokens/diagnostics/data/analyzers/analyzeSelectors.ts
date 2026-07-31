import type { CssData } from '../../../types/compiler.types.ts';

export type UnusableSelector = {
  cssPath: string;
  unusableSelectors: string[];
};

export default function analyzeSelectors(
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



// const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// const usableSelectors: string[] = [];
// const unusableSelectors: string[] = [];




// for (const selector of selectors) {
//   if (VALID_IDENTIFIER.test(selector)) {
//     usableSelectors.push(selector);
//   } else {
//     unusableSelectors.push(selector);
//   }
// }