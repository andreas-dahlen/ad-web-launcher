import type { CssData } from '../../../types/compiler.types';

export type MissingClass = {
  infix: string;
  tokenPath: string;
  usableSelectors: string[];
};
export default function analyzeTokens(cssData: CssData): MissingClass[] {

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