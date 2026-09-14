import type { CssVarString, ValidPrefix } from '../../types/compiler.types.ts';
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

export function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}

export function toCssVar(prefix: string, infix: string, suffix: string): CssVarString {

  return `--${toKebab(prefix)}-${toKebab(infix)}-${toKebab(suffix)}`
}

export function isValidPrefix(
  value: unknown,
): value is ValidPrefix {
  return typeof value === "string" &&
    (prefixPriority).includes(value as ValidPrefix);
}

export function normalizeCssValue(value: unknown): string {
  return String(value).trim().replace(/;\s*$/, "");
}