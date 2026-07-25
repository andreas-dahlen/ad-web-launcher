import type { Root, Rule } from "postcss";
import selectorParser from "postcss-selector-parser";

type SelectorResolution = {
  rules: Map<string, Rule>;
  foundSelectors: string[];
};

export default function resolveSelectors(
  root: Root,
  infixes: string[],
): SelectorResolution {
  const selectors = new Set(
    infixes.map(infix => `.${infix}`)
  );

  const rules = new Map<string, Rule>();
  const foundSelectors = new Set<string>();

  root.walkRules(rule => {
    selectorParser(selectors => {
      selectors.walkClasses(node => {
        foundSelectors.add(node.value);
      });
    }).processSync(rule.selector);

    if (selectors.has(rule.selector)) {
      rules.set(rule.selector, rule);
    }
  });

  return {
    rules,
    foundSelectors: [...foundSelectors],
  };
}