type SelectorGroups = {
  usableSelectors: string[];
  unusableSelectors: string[];
};

const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
export default function analyzeSelectors(selectors: readonly string[]): SelectorGroups {


  const usableSelectors: string[] = [];
  const unusableSelectors: string[] = [];

  for (const selector of selectors) {
    if (VALID_IDENTIFIER.test(selector)) {
      usableSelectors.push(selector);
    } else {
      unusableSelectors.push(selector);
    }
  }

  return {
    usableSelectors,
    unusableSelectors
  };
}