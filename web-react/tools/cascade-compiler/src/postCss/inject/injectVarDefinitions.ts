import type { Rule } from "postcss";
import type { CompilerToken, CompilerVariable } from "../../types/compiler.types.ts";
import { isValidPrefix, normalizeCssValue, prefixPriority, toCssVar } from 'cascade';

export function injectVarDefinitions(
  rule: Rule,
  token: CompilerToken,
  variable: CompilerVariable,
): void {
  const { cssName, effectiveAllowed, values } = variable;

  for (const prefix of prefixPriority) {
    if (!effectiveAllowed.includes(prefix)) continue;

    const value = values[prefix];

    if (!value) continue;

    const cssVar = toCssVar(prefix, token.infix, cssName);

    rule.append({
      prop: cssVar,
      value: isValidPrefix(value)
        ? `var(${toCssVar(value, token.infix, cssName)})`
        : normalizeCssValue(value),
    });
  }
  // console.log(rule.toString());
}