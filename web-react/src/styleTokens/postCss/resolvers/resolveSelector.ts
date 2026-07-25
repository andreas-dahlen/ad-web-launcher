import type { Root, Rule } from "postcss";
import selectorParser from "postcss-selector-parser";

type SelectorResolution = {
  rule: Rule | undefined
  foundSelectors: string[]
};

export default function resolveSelector(root: Root, infix: string): SelectorResolution {
  const selector = `.${infix}`;

  let targetRule: Rule | undefined
  const foundSelectors = new Set<string>();

  root.walkRules(rule => {
    selectorParser(selectors => {
      selectors.walkClasses(node => {
        foundSelectors.add(node.value);
      });
    }).processSync(rule.selector);

    if (rule.selector === selector) {
      targetRule = rule;
    }
  });

  // const { validSelectors, invalidSelectors } = findInvalidSelectors([...availableSelectors]);

  return {
    rule: targetRule,
    foundSelectors: [...foundSelectors]
  };
}
