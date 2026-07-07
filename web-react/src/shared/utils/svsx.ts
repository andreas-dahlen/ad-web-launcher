import type { VarDef, ValidPrefix } from '@utils/svsx.types';
type StyleString = `--${string}`

function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}

function toStyleVar(first: string, second: string, third?: string): StyleString {
  const kebabFirst = toKebab(first)
  const kebabSecond = toKebab(second)
  const kebabThird = third ? `-${toKebab(third)}` : ""
  return `--${kebabFirst}-${kebabSecond}${kebabThird}`
}

/** Transforms an object into CSS style-variable entries */
export function svsx<
  VarsMap extends Record<string, VarDef>,
  AlwaysAllowed extends readonly ValidPrefix[]
>(
  input: Record<string, any>,
  definitions: VarsMap,
  alwaysAllowed: AlwaysAllowed = [] as unknown as AlwaysAllowed,
  namespace?: string
) {
  const output: Record<string, string> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue

    // -----------------------------------------------------
    // PREFIXED KEYS: "t:bg", "o:padding", etc.
    // -----------------------------------------------------
    const hasPrefix = key.includes(":")
    if (hasPrefix) {
      const [prefixKeyRaw, varKey] = key.split(":")

      if (!["o", "s", "m", "p", "t", "f"].includes(prefixKeyRaw)) {
        console.warn(`[svsx] Invalid prefix "${prefixKeyRaw}".`);
        continue;
      }

      const prefixKey = prefixKeyRaw as ValidPrefix;

      const def = definitions[varKey]
      if (!def) {
        console.warn(`[svsx] Unknown variable "${varKey}".`);
        continue
      }
      const prefixAllowed =
        alwaysAllowed?.includes(prefixKey) || def.allowed.includes(prefixKey)

      if (!prefixAllowed) {
        console.warn(`[svsx] Prefix "${prefixKey}" not allowed for "${varKey}".`);
        continue;
      }

      const cssVar = namespace
        ? toStyleVar(prefixKey, namespace, def.name)
        : toStyleVar(prefixKey, def.name)

      output[cssVar] = String(value)
      continue
    }

    // -----------------------------------------------------
    // UNPREFIXED KEYS → PRESET LAYER
    // -----------------------------------------------------
    const def = definitions[key];
    if (def) {
      const cssVar = namespace
        ? toStyleVar("p", namespace, def.name)
        : toStyleVar("p", def.name)

      output[cssVar] = String(value);
      continue;
    }
    // -----------------------------------------------------
    // Unknown key (neither prefixed nor defined)
    // -----------------------------------------------------
    console.warn(`[svsx] Unknown style key "${key}".`);
  }
  return output;
}

/** [USAGE]: const mergedStyles = mergeStyles( buttonVars, styleVars, { preset: { width: "100px" } } ) */
export function mergeStyles<
  VarsMap extends Record<string, VarDef>
>(
  map: VarsMap,
  base: Record<string, any> | undefined,
  ...additions: (Record<string, any> | false | null | undefined)[]
) {
  const out: Record<string, any> = { ...(base ?? {}) };

  for (const add of additions) {
    if (!add) continue;

    for (const [key, value] of Object.entries(add)) {
      if (value == null) continue;

      const hasPrefix = key.includes(":");

      // -----------------------------------------------------
      // PREFIXED KEYS: "t:bg", "o:padding", etc.
      // -----------------------------------------------------
      if (hasPrefix) {
        const [prefixKeyRaw, varKey] = key.split(":");

        if (!["o", "s", "m", "p", "t", "f"].includes(prefixKeyRaw)) {
          console.warn(`[mergeStyles] Invalid prefix "${prefixKeyRaw}". Allowed prefixes: o, s, m, p, t, f`);
          continue;
        }

        if (!(varKey in map)) {
          console.warn(`[mergeStyles] Unknown variable "${varKey}".`);
          continue;
        }

        // Merge prefixed value directly
        out[key] = value;
        continue;
      }

      // -----------------------------------------------------
      // UNPREFIXED KEYS → PRESET LAYER
      // -----------------------------------------------------
      if (key in map) {
        out[key] = value;
        continue;
      }

      // -----------------------------------------------------
      // Unknown key
      // -----------------------------------------------------
      console.warn(`[mergeStyles] Unknown style key "${key}".`);
    }
  }

  return out;
}