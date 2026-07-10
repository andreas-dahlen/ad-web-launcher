const validateDefinition = require("./validateDefinition.cjs");

module.exports = function buildVarDefinitions(rule, component, variable, constants) {
  const { name, allowed, values, exclude } = variable;
  const baseName = `${component.name}-${name}`;

  const effectiveAllowed = [
    ...allowed,
    ...component.alwaysAllowed
  ].filter(p => !exclude.includes(p));

  for (const prefix of constants.prefixPriority) {
    const val = values[prefix];

    // Skip invalid definitions
    if (!validateDefinition(prefix, effectiveAllowed, val, constants.prefixPriority)) {
      continue;
    }

    // Literal value (e.g. "hotPink")
    const isLiteral = typeof val === "string" && !constants.prefixPriority.includes(val);

    if (isLiteral) {
      rule.append({
        prop: `--${prefix}-${baseName}`,
        value: val
      });
      continue;
    }

    // Prefix → prefix mapping (e.g. "p": "f")
    const isPrefixMapping = constants.prefixPriority.includes(val);

    if (isPrefixMapping) {
      rule.append({
        prop: `--${prefix}-${baseName}`,
        value: `var(--${val}-${baseName})`
      });
      continue;
    }
  }
};
