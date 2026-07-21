import fs from "node:fs";
import path from "node:path";

export function findTokenPaths(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findTokenPaths(fullPath);
      }

      if (entry.isFile() &&
        (entry.name.endsWith(".json") ||
          entry.name.endsWith(".jsonc"))
      ) {
        return [fullPath];
      }

      return [];
    })
    .toSorted((a, b) => a.localeCompare(b));
}
