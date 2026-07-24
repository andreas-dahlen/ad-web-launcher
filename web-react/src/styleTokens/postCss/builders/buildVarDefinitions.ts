import type { Rule } from "postcss";
import { isValidVarDefinition } from "../../validation/isValidVarDefinition.ts";
import { toCssVar } from "../../../shared/tokenUtils/stringFormaters.ts";
import { getAllowedPrefixes } from "../../../shared/tokenUtils/getAllowedPrefixes.ts";
import { prefixPriority, isValidPrefix } from "../../../shared/tokenUtils/prefixes.ts"
import { normalizeCssValue } from "../../../shared/tokenUtils/normalizeCssValue.ts";
import type { ValidPrefix } from "../../../shared/tokenUtils/compiler.types.ts";

type Token = {
  infix: string;
  alwaysAllowed: ValidPrefix[];
};

type Variable = {
  name: string;
  allowed: ValidPrefix[];
  values: Partial<Record<ValidPrefix, string>>;
  exclude: ValidPrefix[];
};

export default function buildVarDefinitions(
  rule: Rule,
  token: Token,
  variable: Variable,
): void {
  const { name, allowed, values, exclude } = variable;

  const effectiveAllowed = getAllowedPrefixes(
    allowed,
    token.alwaysAllowed,
    exclude,
  );

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

    if (isValidPrefix(mappedValue)) {
      rule.append({
        prop: toCssVar(prefix, token.infix, name),
        value: `var(${toCssVar(mappedValue, token.infix, name)})`,
      });
    }
  }
}