import { isValidPrefix, normalizeCssValue, toCssVar } from './utils/svsxHelpers.js';
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
export function svsx(input, component) {
    const output = {};
    const primaryGroup = component.vars[component.component];
    if (!primaryGroup) {
        // console.warn(
        //   `[svsx] Missing primary group "${component.component}".`
        // );
        return output;
    }
    if (!input)
        return output;
    // -----------------------------------------------------
    // PRIMARY GROUP FALLBACK
    // -----------------------------------------------------
    processGroup(input, primaryGroup, component.component, output);
    // -----------------------------------------------------
    // NAMED GROUPS
    // -----------------------------------------------------
    for (const [groupName, value] of Object.entries(input)) {
        if (typeof value !== "object" || value == null) {
            continue;
        }
        const group = component.vars[groupName];
        if (!group) {
            // console.warn(`[svsx] Unknown group "${groupName}".`);
            continue;
        }
        processGroup(value, group, groupName, output);
    }
    return output;
}
function processGroup(input, definitions, infix, output) {
    for (const [key, value] of Object.entries(input)) {
        if (value == null)
            continue;
        const hasPrefix = key.includes(":");
        // -----------------------------------------------------
        // PREFIXED KEYS
        // -----------------------------------------------------
        if (hasPrefix) {
            const [prefix, varKey] = key.split(":", 2);
            if (!isValidPrefix(prefix)) {
                // console.warn(`[svsx] Invalid prefix "${prefix}".`);
                continue;
            }
            if (!varKey) {
                continue;
            }
            const def = definitions[varKey];
            if (!def) {
                // console.warn(`[svsx] Unknown variable "${varKey}" in "${infix}".`);
                continue;
            }
            if (!def.allowed.includes(prefix)) {
                // console.warn(`[svsx] Prefix "${prefix}" not allowed for "${varKey}".`);
                continue;
            }
            output[toCssVar(prefix, infix, def.name)] =
                normalizeCssValue(value);
            continue;
        }
        // -----------------------------------------------------
        // UNPREFIXED → PRESET
        // -----------------------------------------------------
        const def = definitions[key];
        if (!def) {
            // console.warn(`[svsx] Unknown style key "${key}" in "${infix}".`);
            continue;
        }
        output[toCssVar("p", infix, def.name)] =
            normalizeCssValue(value);
    }
}
/** [USAGE]: const mergedStyles = mergeStyles( buttonVars, styleVars, { preset: { width: "100px" } } ) */
// export function mergeStyles<
//   VarsMap extends Record<string, VarDef>
// >(
//   map: VarsMap,
//   base: Record<string, unknown> | undefined,
//   ...additions: (Record<string, unknown> | false | null | undefined)[]
// ) {
//   const out: Record<string, unknown> = { ...(base) };
//   for (const add of additions) {
//     if (!add) continue;
//     for (const [key, value] of Object.entries(add)) {
//       if (value == null) continue;
//       const hasPrefix = key.includes(":");
//       // -----------------------------------------------------
//       // PREFIXED KEYS: "t:bg", "o:padding", etc.
//       // -----------------------------------------------------
//       if (hasPrefix) {
//         const [prefixKey, varKey] = key.split(":", 2);
//         if (!isValidPrefix(prefixKey)) {
//           console.warn(`[mergeStyles] Invalid prefix "${prefixKey}". Allowed prefixes: o, s, m, p, t, f`);
//           continue;
//         }
//         if (!(varKey in map)) {
//           console.warn(`[mergeStyles] Unknown variable "${varKey}".`);
//           continue;
//         }
//         // Merge prefixed value directly
//         out[key] = normalizeCssValue(value);
//         continue;
//       }
//       // -----------------------------------------------------
//       // UNPREFIXED KEYS → PRESET LAYER
//       // -----------------------------------------------------
//       if (key in map) {
//         out[key] = normalizeCssValue(value);
//         continue;
//       }
//       // -----------------------------------------------------
//       // Unknown key
//       // -----------------------------------------------------
//       console.warn(`[mergeStyles] Unknown style key "${key}".`);
//     }
//   }
//   return out;
// }
//# sourceMappingURL=svsx.js.map