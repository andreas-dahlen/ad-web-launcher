import type { CssVarString, ValidPrefix } from '../../types/compiler.types.ts';
export declare function toCssVar(prefix: string, infix: string, suffix: string): CssVarString;
export declare function isValidPrefix(value: unknown): value is ValidPrefix;
export declare function normalizeCssValue(value: unknown): string;
//# sourceMappingURL=svsxHelpers.d.ts.map