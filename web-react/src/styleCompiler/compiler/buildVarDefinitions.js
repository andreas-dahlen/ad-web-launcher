import { validateDefinition } from './validateDefinition.js'
import { toCssVar } from '../../shared/compilerUtils/stringFormaters.ts'
import { getAllowedPrefixes } from '../../shared/compilerUtils/getAllowedPrefixes.ts';
import { constants, isValidPrefix } from '../../shared/compilerUtils/prefixes.ts';
import { normalizeCssValue } from '../../shared/compilerUtils/normalizeCssValue.ts'
export default function buildVarDefinitions(rule, component, variable) {
  const { name, allowed, values, exclude } = variable;
  // const baseName = `${component.infix}-${name}`;

  const effectiveAllowed = getAllowedPrefixes(allowed, component.alwaysAllowed, exclude)

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
        prop: toCssVar(prefix, component.infix, name),
        value: normalizeCssValue(mappedValue)
      });
      continue;
    }

    // Prefix → prefix mapping (e.g. "p": "f")
    const isPrefixMapping = isValidPrefix(mappedValue);

    if (isPrefixMapping) {
      rule.append({
        prop: toCssVar(prefix, component.infix, name),
        value: `var(${toCssVar(mappedValue, component.infix, name)})`
      });
      continue;
    }
  }
}
