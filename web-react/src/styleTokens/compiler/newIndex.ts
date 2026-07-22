import type { PluginCreator, Root } from "postcss";
import findTokenPaths from "./loaders/findTokenPaths.ts";
import getToken from "./loaders/getToken.ts";
import getTokens from '@styleTokens/compiler/loaders/getTokens.ts';
// Runtime generation
import generateTokenModules from "./generators/generateTokenModules.ts";
import generatePresetFile from "./generators/generatePresetFile.ts";
// CSS
import buildCascade from "./builders/buildCascade.ts";
import buildVarDefinitions from "./builders/buildVarDefinitions.ts";
import resolveSelector from "./resolvers/resolveSelector.ts";
import resolveVariableUsage from "./resolvers/resolveVariableUsage.ts";
import resolveCssTokenFile from "./resolvers/resolveCssTokenFile.ts";
// Validation
import validateDuplicates from "./validation/validateDuplicates.ts";
// Logging
import reporter from "./logging/tokenReport.ts";
import log from "./logging/consoleLog.ts";

type PluginOptions = {
  tokensDir?: string;
};

const plugin: PluginCreator<PluginOptions> = (opts = {}) => {

  //----------------------------------------------------------
  // Discovery (plugin lifetime)
  //----------------------------------------------------------

  const tokensDir = opts.tokensDir ?? "./src/styleTokens/tokens"; //the or should be moved to constants from shared.. gather constants in one place...

  let cache = createTokenCache(tokensDir);
  reporter.expectTokens(cache.getTokenPaths()); //currently needs token.name but could just be paths now.


  //----------------------------------------------------------
  // Helpers
  //----------------------------------------------------------
  export function refreshCache(tokenPath) {

    cache.refreshToken(tokenPath);
    const tokens = cache.getTokens()
    validateDuplicates(tokens);
    generateTokenModules(tokens);
    log.jsonsLoaded(tokens);
  }
  //----------------------------------------------------------
  // PostCSS
  //----------------------------------------------------------
  return {
    postcssPlugin: "design-tokens-plugin",

    Once(root: Root, { result }) {
      // refreshCache();
      const cssFile = result.opts.from;
      if (!cssFile) return;

      for (const entry of registry) {
        if (entry.cssPath !== cssFile)
          continue;
        const token = //find token in cached tokens


        //---existing code ----

      }
    }
  };
};

plugin.postcss = true;

export default plugin;