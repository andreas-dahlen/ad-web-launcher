import type { Rule } from "postcss";
import { normalizeCssValue, toCssVar } from '../../oldSharedUtils/stringFormaters.ts';
import { isValidPrefix, prefixPriority } from '../../oldSharedUtils/prefixes.ts';
import type { CompilerToken, CompilerVariable } from "../../types/compiler.types.ts";

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
}