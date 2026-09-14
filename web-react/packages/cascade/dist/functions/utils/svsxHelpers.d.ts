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
export declare const prefixPriority: readonly ["o", "s", "m", "p", "t", "f"];
export declare function toKebab(str: string): string;
export declare function toCssVar(prefix: string, infix: string, suffix: string): CssVarString;
export declare function isValidPrefix(value: unknown): value is ValidPrefix;
export declare function normalizeCssValue(value: unknown): string;
//# sourceMappingURL=svsxHelpers.d.ts.map