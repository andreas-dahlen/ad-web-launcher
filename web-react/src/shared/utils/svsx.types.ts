export type ValidPrefix = "o" | "s" | "m" | "p" | "t" | "f";

export type VarDef<A extends readonly ValidPrefix[] = readonly ValidPrefix[]> = {
  name: string;
  allowed: A;
};

type AllPrefixesFor<
  V extends Record<string, VarDef>,
  Always extends readonly ValidPrefix[],
  K extends Extract<keyof V, string>
> =
  V[K]["allowed"][number] | Always[number]; // always allowed short prefixes

type PrefixedKeys<
  V extends Record<string, VarDef>,
  Always extends readonly ValidPrefix[],
  K extends Extract<keyof V, string>
> = `${AllPrefixesFor<V, Always, K>}:${K}`;

export type StyleFromVars<
  V extends Record<string, VarDef>,
  Always extends readonly ValidPrefix[] = []
> =
  Partial<{ [K in keyof V]: string | number }> &
  Partial<{ [K in Extract<keyof V, string> as PrefixedKeys<V, Always, K>]: string | number }>;