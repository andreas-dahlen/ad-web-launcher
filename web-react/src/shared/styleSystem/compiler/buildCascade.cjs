module.exports = function buildCascade(rule, component, variable, constants) {
  const { name, allowed } = variable;
  const baseName = `${component.name}-${name}`;

  const prefixes = [...component.alwaysAllowed, ...allowed];
  const sorted = constants.prefixPriority.filter(p => prefixes.includes(p));

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
