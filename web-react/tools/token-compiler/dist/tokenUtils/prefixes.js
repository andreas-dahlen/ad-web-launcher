export function isValidPrefix(value) {
    return typeof value === "string" &&
        (prefixPriority).includes(value);
}
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
