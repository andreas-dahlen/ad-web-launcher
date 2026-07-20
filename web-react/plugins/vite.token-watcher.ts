import type { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";

function findCssModules(dir: string): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  const result: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      result.push(...findCssModules(fullPath));
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

export default function tokenWatcher(): Plugin {
  return {
    name: "token-watcher",

    configureServer(server) {
      const tokenDeps = findCssModules("./src");

      server.watcher.add("src/styleCompiler/tokens/");

      server.watcher.on("change", file => {
        if (!file.endsWith(".json") && !file.endsWith(".jsonc")) {
          return;
        }

        console.log("🔄 Token changed: rebuilding tokens...");


        for (const cssFile of tokenDeps) {
          if (fs.existsSync(cssFile)) {
            fs.utimesSync(cssFile, Date.now(), Date.now());
          }
        }
      });
    }
  };
}