import type { AcceptedPlugin, Root } from "postcss";
import type { TokenCompiler } from "../../src/styleTokens/compiler/compilerService.ts"

export default function createTokenPostCssAdapter(
  tokenCompiler: TokenCompiler,
): AcceptedPlugin {

  console.log("POSTCSS ENTRY")

  return {
    postcssPlugin: "style-token-compiler",

    Once(root: Root, { result }) {
      const cssPath = result.opts.from;
      if (!cssPath) return;

      tokenCompiler.handleCssModule(root, cssPath);
    },
  };
}