import { normalizeCssValue, toCssVar } from '../../oldSharedUtils/stringFormaters.js';
import { isValidPrefix, prefixPriority } from '../../oldSharedUtils/prefixes.js';
export function injectVarDefinitions(rule, token, variable) {
    const { cssName, effectiveAllowed, values } = variable;
    for (const prefix of prefixPriority) {
        if (!effectiveAllowed.includes(prefix))
            continue;
        const value = values[prefix];
        if (!value)
            continue;
        const cssVar = toCssVar(prefix, token.infix, cssName);
        rule.append({
            prop: cssVar,
            value: isValidPrefix(value)
                ? `var(${toCssVar(value, token.infix, cssName)})`
                : normalizeCssValue(value),
        });
    }
}
