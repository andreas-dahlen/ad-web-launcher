import type { Root, Rule } from "postcss";
import selectorParser from "postcss-selector-parser";
type SelectorGroups = {
  validSelectors: string[];
  invalidSelectors: string[];
};

const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function findInvalidSelectors(selectors: readonly string[]): SelectorGroups {


  const validSelectors: string[] = [];
  const invalidSelectors: string[] = [];

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

type Token = {
  infix: string;
};

type SelectorResolution = {
  rule: Rule | undefined;
  selector: string;
  validSelectors: string[];
  invalidSelectors: string[];
};

export default function resolveSelector(root: Root, token: Token): SelectorResolution {
  const selector = `.${token.infix}`;

  let targetRule;
  const availableSelectors = new Set<string>();

  root.walkRules(rule => {
    selectorParser(selectors => {
      selectors.walkClasses(node => {
        availableSelectors.add(node.value);
      });
    }).processSync(rule.selector);

    if (rule.selector === selector) {
      targetRule = rule;
    }
  });

  const { validSelectors, invalidSelectors } = findInvalidSelectors([...availableSelectors]);

  return {
    rule: targetRule,
    selector,
    validSelectors,
    invalidSelectors
  };
}
