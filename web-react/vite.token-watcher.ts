import type { Plugin } from 'vite';
import fs from "fs";

export default function tokenWatcher(): Plugin {
  return {
    name: "token-watcher",

    configureServer(server) {
      // Watch all JSON token files
      server.watcher.add("src/styleCompiler/tokens/");

      server.watcher.on("change", (file) => {
        if (file.endsWith(".json")) {
          console.log("🔄 JSON changed — rebuilding tokens...");


          const cssFile = "src/styleCompiler/tokens.module.css";

          // Update timestamp → Vite thinks CSS changed
          if (fs.existsSync(cssFile)) {
            fs.utimesSync(cssFile, Date.now(), Date.now());
          } else {
            console.warn("⚠️ CSS file not found:", cssFile);
          }
        }
      })
    }
  }
}