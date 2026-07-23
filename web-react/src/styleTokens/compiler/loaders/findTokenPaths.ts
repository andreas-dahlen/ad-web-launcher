import fs from "node:fs";
import path from "node:path";

export default function findTokenPaths(target: string): string[] {
  const absoluteTarget = path.resolve(target);

  const stat = fs.statSync(absoluteTarget);
  if (stat.isFile()) {
    return [absoluteTarget];
  }

  return fs.readdirSync(absoluteTarget, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(absoluteTarget, entry.name);

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
