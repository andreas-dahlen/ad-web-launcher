export default function resolveSelector(root, component) {

  const selector = `.${component.infix}`;

  let targetRule;
  const availableSelectors = [];

  root.walkRules(rule => {
    availableSelectors.push(rule.selector);
    if (rule.selector === selector) {
      targetRule = rule;
    }
  });

  return {
    rule: targetRule,
    selector,
    availableSelectors
  }
}