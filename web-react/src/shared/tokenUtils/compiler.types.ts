export type ValidPrefix = "o" | "s" | "m" | "p" | "t" | "f";

export type CssVarString = `--${string}`

export type RawVarDef = {
  name?: string;
  allowed?: string[];
  exclude?: string[];

  // Compiler-only preset data. Ignored by TS model.
  values?: Record<ValidPrefix, string>;
};

export type RawComponent = {
  component: string;
  infix?: string;
  alwaysAllowed?: string[];
  vars: Record<string, RawVarDef>;
};

export type VarDef<
  A extends readonly ValidPrefix[] = readonly ValidPrefix[],
  E extends readonly ValidPrefix[] = readonly ValidPrefix[]
> = {
  name: string;
  allowed: A;
  exclude: E;
};

type AllPrefixesFor<
  V extends Record<string, VarDef>,
  Always extends readonly ValidPrefix[],
  K extends Extract<keyof V, string>
> =
  Exclude<
    V[K]["allowed"][number] | Always[number],
    V[K]["exclude"][number]
  >;

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