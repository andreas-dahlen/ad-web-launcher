export const VALID_PREFIXES = [
  "override",
  "state",
  "mode",
  "preset",
  "theme",
  "fallback"
] as const;

export type ValidPrefix = typeof VALID_PREFIXES[number];
type VarDef = {
  name: string;
  allowed: readonly ValidPrefix[];
};

type StyleString = `--${string}`

function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}

function toStyleVar(prefix: string, name: string): StyleString {
  const kebabName = toKebab(name)
  const kebabPrefix = toKebab(prefix)
  return `--${kebabPrefix}-${kebabName}`
}

/** Transforms an object into CSS style-variable entries */
export function svsx<
  VarsMap extends Record<string, VarDef>,
  AlwaysAllowed extends readonly ValidPrefix[]
>(
  input: Record<string, any>,
  definitions: VarsMap,
  alwaysAllowed?: AlwaysAllowed
) {
  const output: Record<string, string> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;

    const isPrefixGroup = typeof value === "object" && !Array.isArray(value);
    // 1. Prefixed group: { override: { bg: "red" } }
    if (isPrefixGroup) {
      const prefix = key;

      if (!VALID_PREFIXES.includes(prefix as ValidPrefix)) {
        console.warn(`[svsx] Invalid prefix "${prefix}". Allowed prefixes: ${VALID_PREFIXES.join(", ")}`);
        continue; // or throw, depending on how strict you want to be
      }


      for (const [varKey, varValue] of Object.entries(value)) {
        const def = definitions[varKey];
        if (!def) continue;

        const prefixAllowed =
          alwaysAllowed?.includes(prefix as ValidPrefix) ||
          def.allowed.includes(prefix as ValidPrefix)

        if (!prefixAllowed) continue;

        const cssVar = toStyleVar(prefix, def.name);
        output[cssVar] = String(varValue);
      }

      continue;
    }

    const def = definitions[key];
    if (def) {
      const cssVar = toStyleVar("preset", def.name);
      output[cssVar] = String(value);
      continue;
    }
  }
  return output;
}

/** [USAGE]: const mergedStyles = mergeStyles( buttonVars, styleVars, { preset: { width: "100px" } } ) */
export function mergeStyles<
  VarsMap extends Record<string, VarDef>
>(
  map: VarsMap,
  base: Record<keyof VarsMap, any> | undefined,
  ...additions: (Record<ValidPrefix, any> | false | null | undefined)[]
) {
  const out: Record<string, any> = { ...(base ?? {}) };

  for (const add of additions) {
    if (!add) continue;

    for (const [key, value] of Object.entries(add)) {
      // If key exists in map, merge directly
      if (key in map) {
        out[key] = value;
        continue;
      }

      // If key is a prefix group (override, preset, theme, etc)
      if (typeof value === "object" && !Array.isArray(value)) {
        if (!VALID_PREFIXES.includes(key as ValidPrefix)) {
          console.warn(`[svsx] Invalid prefix "${key}". Allowed prefixes: ${VALID_PREFIXES.join(", ")}`);
          continue;
        }

        out[key] = {
          ...(out[key] ?? {}),
          ...value
        };
      }
    }
  }
  return out;
}