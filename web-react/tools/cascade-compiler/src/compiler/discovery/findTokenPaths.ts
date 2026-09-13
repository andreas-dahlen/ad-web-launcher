import fs from "node:fs";
import path from "node:path";

export function findTokenPaths(target: string): string[] {
  const absoluteTarget = path.resolve(target);

  const stat = fs.statSync(absoluteTarget);
  if (stat.isFile() && isTokenFile(absoluteTarget)
  ) {
    return [absoluteTarget];
  }

  return fs.readdirSync(absoluteTarget, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(absoluteTarget, entry.name);

      if (entry.isDirectory()) {
        return findTokenPaths(fullPath);
      }

      if (entry.isFile() &&
        isTokenFile(entry.name)
      ) {
        return [fullPath];
      }

      return [];
    })
    .toSorted((a, b) => a.localeCompare(b));
}

function isTokenFile(filePath: string): boolean {
  return filePath.endsWith(".json") ||
    filePath.endsWith(".jsonc");
}
