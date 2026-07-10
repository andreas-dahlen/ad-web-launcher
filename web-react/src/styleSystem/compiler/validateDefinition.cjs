

module.exports = function validateDefinition(prefix, effectiveAllowed, value, prefixPriority) {

  // 1. Prefix must be allowed (after merging + excluding)
  if (!effectiveAllowed.includes(prefix)) return false;

  // 2. Value cannot map to itself
  if (value === prefix) return false;

  // 3. Literal value (e.g. "hotPink")
  const isLiteral = typeof value === "string" && !prefixPriority.includes(value);
  if (isLiteral) return true;

  // 4. Prefix → prefix mapping (e.g. "p": "f")
  const isPrefixMapping = prefixPriority.includes(value);
  if (isPrefixMapping) {
    // The target prefix must also be allowed
    return effectiveAllowed.includes(value);
  }

  // 5. Anything else is invalid
  return false;
};