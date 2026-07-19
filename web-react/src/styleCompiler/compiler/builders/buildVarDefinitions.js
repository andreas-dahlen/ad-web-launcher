import { validateDefinition } from '../validation/validateVarDefinition.js'
import { toCssVar } from '../../../shared/compilerUtils/stringFormaters.ts'
import { getAllowedPrefixes } from '../../../shared/compilerUtils/getAllowedPrefixes.ts';
import { constants, isValidPrefix } from '../../../shared/compilerUtils/prefixes.ts';
import { normalizeCssValue } from '../../../shared/compilerUtils/normalizeCssValue.ts'
export default function buildVarDefinitions(rule, token, variable) {
  const { name, allowed, values, exclude } = variable;
  // const baseName = `${token.infix}-${name}`;

  const effectiveAllowed = getAllowedPrefixes(allowed, token.alwaysAllowed, exclude)

  for (const prefix of constants.prefixPriority) {
    const mappedValue = values[prefix];

    // Skip invalid definitions
    if (!validateDefinition(prefix, effectiveAllowed, mappedValue, constants.prefixPriority)) {
      continue;
    }

    // Literal value (e.g. "hotPink")
    const isLiteral = !isValidPrefix(mappedValue);

    if (isLiteral) {
      rule.append({
        prop: toCssVar(prefix, token.infix, name),
        value: normalizeCssValue(mappedValue)
      });
      continue;
    }

    // Prefix → prefix mapping (e.g. "p": "f")
    const isPrefixMapping = isValidPrefix(mappedValue);

    if (isPrefixMapping) {
      rule.append({
        prop: toCssVar(prefix, token.infix, name),
        value: `var(${toCssVar(mappedValue, token.infix, name)})`
      });
      continue;
    }
  }
}
