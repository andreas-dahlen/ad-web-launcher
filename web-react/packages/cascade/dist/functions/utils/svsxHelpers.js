/**
 * Prefix semantics
 *
 * o = Override (explicit consumer override)
 * s = State (hover, pressed, disabled)
 * m = Mode (primary, compact, danger)
 * p = Preset (named visual style)
 * t = Theme (application theme)
 * f = Fallback (component defaults)
 */
export const prefixPriority = [
    "o", "s", "m", "p", "t", "f"
];
export function toKebab(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
}
export function toCssVar(prefix, infix, suffix) {
    return `--${toKebab(prefix)}-${toKebab(infix)}-${toKebab(suffix)}`;
}
export function isValidPrefix(value) {
    return typeof value === "string" &&
        (prefixPriority).includes(value);
}
export function normalizeCssValue(value) {
    return String(value).trim().replace(/;\s*$/, "");
}
//# sourceMappingURL=svsxHelpers.js.map