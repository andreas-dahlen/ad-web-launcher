import { extractGroupName } from '../resolvers/extractGroupName.js';
import path from "node:path"
import fs from "node:fs"
export function findCssModulePath(
  rootPath: string,
  groupPath: string,
): string | undefined {
  const groupName = extractGroupName(groupPath).toLowerCase();

  return searchDirectory(rootPath, groupName);
}

function searchDirectory(
  dir: string,
  groupName: string,
): string | undefined {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const match = searchDirectory(
        fullPath,
        groupName,
      );

      if (match) {
        return match;
      }

      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(".module.css") &&
      path.basename(entry.name, ".module.css").toLowerCase() === groupName
    ) {
      return fullPath;
    }
  }

  return undefined;
}