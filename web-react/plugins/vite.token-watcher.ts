import type { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import getTokenOwner from "../src/shared/tokenUtils/getTokenOwner.ts";

function findCssModules(dir: string): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  const result: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      result.push(...findCssModules(fullPath));
      continue;
    }

    if (
      file.isFile() &&
      file.name.endsWith(".module.css")
    ) {
      result.push(fullPath);
    }
  }

  return result;
}

function buildCssModuleMap(cssFiles: string[]) {
  const map = new Map<string, string>();

  for (const file of cssFiles) {
    const name = path
      .basename(file, ".module.css")
      .toLowerCase();

    map.set(name, file);
  }

  return map;
}

export default function tokenWatcher(): Plugin {
  const cssCache = new Map<string, string>();

  return {
    name: "token-watcher",

    configureServer(server) {
      const cssFiles = findCssModules("./src");
      const cssMap = buildCssModuleMap(cssFiles);

      server.watcher.add("src/tokenCompiler/tokens/");

      server.watcher.on("change", file => {
        if (
          !file.endsWith(".json") &&
          !file.endsWith(".jsonc")
        ) {
          return;
        }

        const cacheKey = path.normalize(file);

        console.log("🔄 Token changed:", file);

        let cssFile = cssCache.get(cacheKey);

        if (!cssFile) {
          const owner = getTokenOwner(file);

          cssFile = cssMap.get(owner.toLowerCase());

          if (cssFile) {
            cssCache.set(cacheKey, cssFile);
          }
        }

        if (!cssFile) {
          console.warn("⚠️ No CSS module found for token:", file);
          return;
        }

        if (fs.existsSync(cssFile)) {
          fs.utimesSync(
            cssFile, new Date(), new Date());

          console.log("🔥 Reloading:", cssFile);
        }
      });
    }
  };
}