module.exports = function buildCascade(rule, component, variable, constants) {
  const { name, allowed, exclude } = variable;
  const baseName = `${component.inFix}-${name}`;


  const effectiveAllowed = [
    ...allowed,
    ...component.alwaysAllowed
  ].filter(p => !exclude.includes(p));

  const sorted = constants.prefixPriority.filter(p => effectiveAllowed.includes(p));

  const chain = sorted.reduceRight(
    (acc, curr) =>
      `var(--${curr}-${baseName}${acc ? `, ${acc}` : ""})`,
    ""
  );

  rule.append({
    prop: `--final-${baseName}`,
    value: chain
  });
};
