import type { Rule } from "postcss";
import { normalizeCssValue, toCssVar } from "../../../shared/tokenUtils/stringFormaters.ts";
import { prefixPriority, isValidPrefix } from "../../../shared/tokenUtils/prefixes.ts";
import type { CompilerToken, CompilerVariable } from "../../types/compiler.types.ts";

export default function buildVarDefinitions(
  rule: Rule,
  token: CompilerToken,
  variable: CompilerVariable,
): void {
  const { name, effectiveAllowed, values } = variable;

  for (const prefix of prefixPriority) {
    if (!effectiveAllowed.includes(prefix)) continue;

    const value = values[prefix];

    if (!value) continue;

    const cssVar = toCssVar(prefix, token.infix, name);

    rule.append({
      prop: cssVar,
      value: isValidPrefix(value)
        ? `var(${toCssVar(value, token.infix, name)})`
        : normalizeCssValue(value),
    });
  }
}