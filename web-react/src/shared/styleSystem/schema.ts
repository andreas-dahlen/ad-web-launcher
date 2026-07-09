import surfaceJson from "./tokens/surface.json";
import type { ValidPrefix, VarDef } from "../utils/svsx.types";

// Runtime guard: ensure prefix is valid
function toValidPrefix(p: string): ValidPrefix {
  const valid: ValidPrefix[] = ["o", "s", "m", "p", "t", "f"];
  if (!valid.includes(p as ValidPrefix)) {
    throw new Error(`Invalid prefix "${p}" in JSON`);
  }
  return p as ValidPrefix;
}

// Convert JSON vars → TS VarDef objects
function convertVars(vars: Record<string, { name?: string; allowed?: string[] }>):
  Record<string, VarDef> {

  const result: Record<string, VarDef> = {};

  for (const key in vars) {
    const def = vars[key] || {}

    const name = typeof def.name === "string" && def.name.trim()
      ? def.name.trim()
      : key

    const allowed = Array.isArray(def.allowed)
      ? def.allowed.map(toValidPrefix)
      : []

    result[key] = {
      name,
      allowed
    };
  }

  return result;
}

// Convert one component JSON file → TS structure
function convertComponent(json: {
  component: string;
  inFix?: string;
  alwaysAllowed?: string[];
  vars: Record<string, { name?: string; allowed?: string[] }>;
}) {
  return {
    component: json.component,
    inFix: json.inFix ?? json.component,
    alwaysAllowed: Array.isArray(json.alwaysAllowed)
      ? json.alwaysAllowed.map(toValidPrefix)
      : [],
    vars: convertVars(json.vars)
  };
}

// Export converted components
export const surface = convertComponent(surfaceJson);

// If you add button.json later:
// import buttonJson from "./tokens/button.json";
// export const button = convertComponent(buttonJson);

// export const designTokens = tokens;
// export type DesignTokens = typeof tokens;