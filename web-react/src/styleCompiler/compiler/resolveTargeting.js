export default function resolveTargeting(root, component) {
  const selector = `.${component.infix}`;

  let targetRule;

  root.walkRules(rule => {
    if (rule.selector === selector) {
      targetRule = rule;
    }
  });

  if (!targetRule) {
    throw new Error(
      `Missing target selector ${selector}`
    );
  }

  return targetRule;
}