import type { TokenComponent } from "../types/compiler.types.ts";
type StyleInput = Record<string, unknown>;
/**
 * Resolves style variables against a generated TokenComponent.
 * Primary component vars can be passed directly:
 * { bg: "red" }
 *
 * Named groups can be targeted explicitly:
 * { thumb: {
 *      bg: "blue"
 *          }
 * }
 */
export declare function svsx(input: StyleInput | null | undefined, component: TokenComponent): Record<string, string>;
export {};
/** [USAGE]: const mergedStyles = mergeStyles( buttonVars, styleVars, { preset: { width: "100px" } } ) */
//# sourceMappingURL=svsx.d.ts.map