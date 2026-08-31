import type { CssDataTokenGroup, CssTokenGroup, TokenGroup } from "../types/compiler.types.js";
import type { CssVarString } from '../oldSharedUtils/oldSharedCompiler.types.js';
import type { CompilerConfig, EmitConfig } from '../types/run.types.js';


type Assertions = {
  cssVariable(value: string): asserts value is CssVarString;
  hasCssPath(group: TokenGroup | undefined): asserts group is CssTokenGroup
  hasOutPath(config: CompilerConfig): asserts config is EmitConfig
  groupsHaveCssPath(groups: TokenGroup[]): asserts groups is CssTokenGroup[]
  groupsHaveCssData(groups: TokenGroup[]): asserts groups is CssDataTokenGroup[]
};

const CSS_VARIABLE = /^--[A-Za-z_][A-Za-z0-9_-]*$/

export const assert: Assertions = {


  cssVariable(value): asserts value is CssVarString {
    if (!CSS_VARIABLE.test(value)) {
      throw new Error(
        `Invariant violated: "${value}" is not a CSS custom property.`,
      )
    }
  },

  hasCssPath(group) {
    if (!group?.cssPath) {
      throw new Error(
        `Invariant violated: Token group "${group?.groupPath}" has no cssPath.`,
      )
    }
  },

  hasOutPath(
    config: CompilerConfig,
  ): asserts config is EmitConfig & { outPath: string } {
    if (!config.outPath) {
      throw new Error('Expected compiler config to have an outPath')
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
      if (!group.cssData) {
        throw new Error(
          `Invariant violated: A token in tokenGroups "${group.groupPath}" has no cssData.`,
        )
      }
    }
  },
}