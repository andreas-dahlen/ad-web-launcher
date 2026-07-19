import fs from "fs";
import path from "path";

export function findTokenFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findTokenFiles(fullPath);
      }

      if (entry.isFile() &&
        (entry.name.endsWith(".json") ||
          entry.name.endsWith(".jsonc"))
      ) {
        return [fullPath];
      }

      return [];
    })
    .sort();
}
