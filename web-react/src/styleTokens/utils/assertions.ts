import { printParseErrorCode, type ParseError } from 'jsonc-parser';
import type { CssDataTokenGroup, CssTokenGroup, TokenGroup } from "../types/compiler.types.ts";
import type { RawToken, RawVariable } from "../types/compiler.types.ts"
import type { CssVarString } from '../../shared/tokenUtils/compiler.types.ts';

type Assertions = {
  token(errors: ParseError[], json: RawToken, fullPath: string): void;
  variable(key: string, def: unknown, fullPath: string): asserts def is RawVariable;
  cssVariable(value: string): asserts value is CssVarString;
  hasCssPath(group: TokenGroup | undefined): asserts group is CssTokenGroup
  groupsHaveCssPath(groups: TokenGroup[]): asserts groups is CssTokenGroup[]
  groupsHaveCssData(groups: TokenGroup[]): asserts groups is CssDataTokenGroup[]
};

const CSS_VARIABLE = /^--[A-Za-z_][A-Za-z0-9_-]*$/;
export const assert: Assertions = {


  token(errors, json, fullPath) {
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

    const variable = def as RawVariable;

    if (variable.name !== undefined &&
      (typeof variable.name !== "string" || !variable.name.trim())) {
      throw new Error(`❌ Variable "${key}" name must be a non empty string in ${fullPath}`
      );
    }

    if (variable.allowed !== undefined && !Array.isArray(variable.allowed)) {
      throw new Error(
        `❌ Variable "${key}" allowed must be an array in ${fullPath}`
      );
    }

    if (variable.exclude !== undefined && !Array.isArray(variable.exclude)) {
      throw new Error(`❌ Variable "${key}" exclude must be an array in ${fullPath}`);
    }

    if (variable.values !== undefined &&
      (typeof variable.values !== "object" ||
        variable.values === null ||
        Array.isArray(variable.values))) {
      throw new Error(`❌ Variable "${key}" values must be an object in ${fullPath}`);
    }
  },

  cssVariable(value): asserts value is CssVarString {
    if (!CSS_VARIABLE.test(value)) {
      throw new Error(
        `Invariant violated: "${value}" is not a CSS custom property.`,
      );
    }
  },

  hasCssPath(group) {
    if (!group?.cssPath) {
      throw new Error(
        `Invariant violated: Token group "${group?.groupPath}" has no cssPath.`,
      );
    }
  },

  groupsHaveCssPath(groups) {
    for (const group of groups) {
      if (!group.cssPath) {
        throw new Error(
          `Invariant violated: Token group "${group.groupPath}" has no cssPath.`,
        )
      }
    }
  },

  groupsHaveCssData(groups) {
    for (const group of groups) {
      if (!group?.cssData) {
        throw new Error(
          `Invariant violated: A token in tokenGroups "${group.groupPath}" has no cssData.`,
        );
      }
    }
  }
}