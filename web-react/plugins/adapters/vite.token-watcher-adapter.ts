import type { Plugin } from "vite";
import fs from "node:fs";
import type { TokenCompiler } from "../../src/styleTokens/compiler/compilerService.ts";

export default function createTokenWatcherAdapter(
  tokenCompiler: TokenCompiler,
): Plugin {
  return {
    name: "token-watcher",

    configureServer(server) {
      server.watcher.on("change", tokenPath => {
        if (
          !tokenPath.endsWith(".json") &&
          !tokenPath.endsWith(".jsonc")
        ) {
          return;
        }

        const cssPath = tokenCompiler.handleTokenChange(tokenPath);

        if (!cssPath || !fs.existsSync(cssPath)) {
          return;
        }

        fs.utimesSync(cssPath, new Date(), new Date());
      });
    },
  };
}