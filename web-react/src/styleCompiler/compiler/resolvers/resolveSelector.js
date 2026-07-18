import selectorParser from "postcss-selector-parser";
import findInvalidSelectors from '../findInvalidSelectors.js';

export default function resolveSelector(root, component) {
  const selector = `.${component.infix}`;

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