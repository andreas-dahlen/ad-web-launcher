import selectorParser from "postcss-selector-parser";

const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function findInvalidSelectors(selectors) {


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
export default function resolveSelector(root, token) {
  const selector = `.${token.infix}`;

  let targetRule;
  const availableSelectorsMap = new Set();

  root.walkRules(rule => {
    selectorParser(selectors => {
      selectors.walkClasses(node => {
        availableSelectorsMap.add(node.value);
      });
    }).processSync(rule.selector);

    if (rule.selector === selector) {
      targetRule = rule;
    }
  });

  const { validSelectors, invalidSelectors } = findInvalidSelectors([...availableSelectorsMap]);

  return {
    rule: targetRule,
    selector,
    validSelectors,
    invalidSelectors
  };
}
