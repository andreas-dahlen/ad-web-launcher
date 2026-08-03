import type { Plugin } from "vite";
import fs from "node:fs";
import path from 'node:path';
import type { TokenCompiler } from "../../src/styleTokens/compiler/compilerService.ts";

const tokenRoot = path.resolve("./src/styleTokens/tokens");

function isTokenFile(filePath: string): boolean {
  const relative = path.relative(tokenRoot, filePath);

  return (
    !relative.startsWith("..") &&
    !path.isAbsolute(relative) &&
    (filePath.endsWith(".json") || filePath.endsWith(".jsonc"))
  );
}
export default function createTokenWatcherAdapter(
  tokenCompiler: TokenCompiler,
): Plugin {

  return {
    name: "token-watcher",

    configureServer(server) {
      server.watcher.on("change", tokenPath => {
        if (!isTokenFile(tokenPath)) {
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