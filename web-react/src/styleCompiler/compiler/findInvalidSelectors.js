const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
export default function findInvalidSelectors(selectors) {


  const validSelectors = [];
  const invalidSelectors = [];

  for (const selector of selectors) {
    if (VALID_IDENTIFIER.test(selector)) {
      validSelectors.push(selector);
    } else {
      invalidSelectors.push(selector);
    }
  }

  return {
    validSelectors,
    invalidSelectors
  };
}