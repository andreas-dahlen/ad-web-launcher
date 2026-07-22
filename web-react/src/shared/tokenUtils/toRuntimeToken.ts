import type { RawComponent, RawVarDef, VarDef } from './compiler.types';
import { assertValidPrefix } from './prefixes';

// Runtime guard: ensure prefix is valid
// function toValidPrefix(p: string): ValidPrefix {
//   const valid: ValidPrefix[] = ["o", "s", "m", "p", "t", "f"];
//   if (!valid.includes(p as ValidPrefix)) {
//     throw new Error(`Invalid prefix "${p}" in JSON`);
//   }
//   return p as ValidPrefix;
// }

// Convert JSON vars → TS VarDef objects
function convertVars(vars: Record<string, RawVarDef>):
  Record<string, VarDef> {
  const result: Record<string, VarDef> = {};

  for (const key in vars) {
    const def = vars[key] || {}

    const name = typeof def.name === "string" && def.name.trim()
      ? def.name.trim()
      : key

    const allowed = Array.isArray(def.allowed)
      ? def.allowed.map(assertValidPrefix)
      : []

    const exclude = Array.isArray(def.exclude)
      ? def.exclude.map(assertValidPrefix)
      : [];

    result[key] = {
      name,
      allowed,
      exclude,
    };
  }

  return result;
}

// Convert one component JSON file → TS structure
export function convertJson(json: RawComponent) {
  return {
    component: json.component,
    infix: json.infix ?? json.component,
    alwaysAllowed: Array.isArray(json.alwaysAllowed)
      ? json.alwaysAllowed.map(assertValidPrefix)
      : [],
    vars: convertVars(json.vars)
  };
}