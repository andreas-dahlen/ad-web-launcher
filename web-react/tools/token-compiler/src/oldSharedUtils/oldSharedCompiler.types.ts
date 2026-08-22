export type ValidPrefix =
  | "o" // Override
  | "s" // State
  | "m" // Mode
  | "p" // Preset
  | "t" // Theme
  | "f"; // Fallback

export type CssVarString = `--${string}`;

// type VarDef<
//   A extends readonly ValidPrefix[] = readonly ValidPrefix[]
// > = {
//   name: string;
//   allowed: A;
// };

// export type TokenGroup = Record<string, VarDef>;

// export type TokenComponent = {
//   component: string;
//   vars: Record<string, TokenGroup>;
// };

// type StyleValue = string | number;

// type PrefixedKey<
//   K extends string,
//   A extends readonly ValidPrefix[]
// > = `${A[number]}:${K}`;

// type StyleFromGroup<
//   G extends TokenGroup
// > =
//   Partial<Record<keyof G, StyleValue>> &
//   Partial<{
//     [K in Extract<keyof G, string> as PrefixedKey<K, G[K]["allowed"]>]:
//     StyleValue;
//   }>;

// type NamedGroups<
//   V extends Record<string, TokenGroup>
// > = Partial<{
//   [K in keyof V]: StyleFromGroup<V[K]>;
// }>;

// export type StyleFromComponent<
//   C extends TokenComponent
// > =
//   StyleFromGroup<C["vars"][C["component"]]> &
//   NamedGroups<C["vars"]>;