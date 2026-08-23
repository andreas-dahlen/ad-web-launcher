import type { ValidPrefix } from './compiler.types.ts';

export function isValidPrefix(
  value: unknown,
): value is ValidPrefix {
  return typeof value === "string" &&
    (prefixPriority).includes(value as ValidPrefix);
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
] as const satisfies readonly ValidPrefix[]