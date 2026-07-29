import type { Rule } from "postcss";
import { isValidVarDefinition } from "../../validation/isValidVarDefinition.ts";
import { toCssVar } from "../../../shared/tokenUtils/stringFormaters.ts";
import { prefixPriority, isValidPrefix } from "../../../shared/tokenUtils/prefixes.ts"
import { normalizeCssValue } from "../../../shared/tokenUtils/normalizeCssValue.ts";
import type { LoadedToken, LoadedVariable } from '../../types/compiler.types.ts';

export default function buildVarDefinitions(
  rule: Rule,
  token: LoadedToken,
  variable: LoadedVariable,
): void {
  const { name, effectiveAllowed, values, } = variable;


  for (const prefix of prefixPriority) {
    const mappedValue = values[prefix];

    if (!isValidVarDefinition(prefix, effectiveAllowed, mappedValue)) {
      continue;
    }

    const isLiteral = !isValidPrefix(mappedValue);

    if (isLiteral) {
      rule.append({
        prop: toCssVar(prefix, token.infix, name),
        value: normalizeCssValue(mappedValue),
      });

      continue;
    }
    rule.append({
      prop: toCssVar(prefix, token.infix, name),
      value: `var(${toCssVar(mappedValue, token.infix, name)})`,
    });
  }
}