import { toCssVar } from '../../oldSharedUtils/stringFormaters.js';
export function injectCascade(rule, token, variable) {
    const { cssName, effectiveAllowed } = variable;
    const chain = effectiveAllowed.reduceRight((acc, prefix) => `var(${toCssVar(prefix, token.infix, cssName)}${acc ? `, ${acc}` : ""})`, "");
    rule.append({
        prop: toCssVar("final", token.infix, cssName),
        value: chain
    });
}
