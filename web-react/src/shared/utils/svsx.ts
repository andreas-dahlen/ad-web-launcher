import type { VarDef, ValidPrefix } from '@utils/svsx.types';
type StyleString = `--${string}`

function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}

function toStyleVar(first: string, second: string, third: string): StyleString {
  return `--${toKebab(first)}-${toKebab(second)}-${toKebab(third)}`
}

/** Transforms an object into CSS style-variable entries */
export function svsx(
  input: Record<string, unknown>,
  component: {
    vars: Record<string, VarDef>;
    alwaysAllowed: readonly ValidPrefix[];
    inFix: string;
  }
) {
  const output: Record<string, string> = {};
  const { vars: definitions, alwaysAllowed, inFix } = component;

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
      const effectiveAllowed = [
        ...def.allowed,
        ...alwaysAllowed
      ].filter(p => !def.exclude.includes(p));

      if (!effectiveAllowed.includes(prefixKey)) {
        console.warn(`[svsx] Prefix "${prefixKey}" not allowed for "${varKey}".`);
        continue;
      }

      const cssVar = toStyleVar(prefixKey, inFix, def.name);

      output[cssVar] = String(value)
      continue
    }

    // -----------------------------------------------------
    // UNPREFIXED KEYS → PRESET LAYER
    // -----------------------------------------------------
    const def = definitions[key];
    if (def) {
      const cssVar = toStyleVar("p", inFix, def.name)
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
  base: Record<string, unknown> | undefined,
  ...additions: (Record<string, unknown> | false | null | undefined)[]
) {
  const out: Record<string, unknown> = { ...(base) };

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