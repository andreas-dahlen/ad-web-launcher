import formatLogPath from '../diagnostics/formatLogPath.ts';
import type { RawComponent, RawVarDef } from '../../shared/tokenUtils/compiler.types.ts';
import { printParseErrorCode, type ParseError } from "jsonc-parser";
type TokenValidation = {
  parse(errors: ParseError[], json: RawComponent, fullPath: string): void;
  variable(key: string, def: RawVarDef, fullPath: string): void;
  duplicates(previous: { tokenPath: string } | undefined, cssVariable: string, fullPath: string): never;
};
const validate: TokenValidation = {

  parse(errors, json, fullPath) {
    if (errors.length > 0) {
      const details = errors
        .map(error => printParseErrorCode(error.error))
        .join(", ");

      throw new Error(`❌ Invalid JSON in ${fullPath}: ${details}`);
    }

    if (typeof json.component !== "string" || !json.component.trim()) {
      throw new Error(`❌ "component" must be a non empty string in ${fullPath}`);
    }

    if (
      json.vars !== undefined &&
      (
        typeof json.vars !== "object" ||
        Array.isArray(json.vars)
      )
    ) {
      throw new Error(`❌ "vars" must be an object in ${fullPath}`);
    }

    if (json.alwaysAllowed !== undefined &&
      !Array.isArray(json.alwaysAllowed)) {
      throw new Error(`❌ "alwaysAllowed" must be an array in ${fullPath}`);
    }

    if (json.infix !== undefined &&
      typeof json.infix !== "string") {
      throw new Error(`❌ "infix" must be a string in ${fullPath}`);
    }
  },


  variable(key, def, fullPath) {

    if (typeof def !== "object" || def === null || Array.isArray(def)) {
      throw new Error(`❌ Variable "${key}" must be an object in ${fullPath}`);
    }

    if (def.name !== undefined &&
      (typeof def.name !== "string" || !def.name.trim())) {
      throw new Error(`❌ Variable "${key}" name must be a non empty string in ${fullPath}`
      );
    }

    if (def.allowed !== undefined && !Array.isArray(def.allowed)) {
      throw new Error(
        `❌ Variable "${key}" allowed must be an array in ${fullPath}`
      );
    }

    if (def.exclude !== undefined && !Array.isArray(def.exclude)) {
      throw new Error(`❌ Variable "${key}" exclude must be an array in ${fullPath}`);
    }

    if (def.values !== undefined &&
      (typeof def.values !== "object" ||
        def.values === null ||
        Array.isArray(def.values))) {
      throw new Error(`❌ Variable "${key}" values must be an object in ${fullPath}`);
    }
  },

  duplicates(previous, cssVariable, fullPath) {
    throw new Error(
      [`❌ CSS variable collision!`,
        `\nGenerated variable:`,
        `   ${cssVariable}`,
        `\nSources:`,
        `     ${formatLogPath(fullPath)}`,
        `     ${previous && formatLogPath(previous.tokenPath)}\n`
      ].join("\n")
    );
  }
}

export default validate;