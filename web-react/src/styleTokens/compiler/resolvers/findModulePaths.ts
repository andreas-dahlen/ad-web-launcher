import fs from "node:fs";
import path from "node:path";
import resolveTokenGroup from "../../../shared/tokenUtils/resolveTokenGroup.ts";

export default function findModulePaths(
  tokenPaths: string[],
): Map<string, string> {

  const cssModules = findCssModules(path.resolve("./src"));

  const cssMap = new Map<string, string>();

  const groups = new Set(
    tokenPaths.map(resolveTokenGroup)
  );

  for (const groupPath of groups) {
    const groupName = extractName(groupPath);

    const cssPath = cssModules.find(file => {
      const name = path
        .basename(file, ".module.css")
        .toLowerCase();

      return name === groupName;
    });

    if (cssPath) {
      cssMap.set(groupPath, cssPath);
    }
  }

  return cssMap;
}


function findCssModules(dir: string): string[] {
  const result: string[] = [];

  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...findCssModules(fullPath));
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(".module.css")
    ) {
      result.push(fullPath);
    }
  }

  return result;
}


function extractName(groupPath: string): string {
  const normalized = groupPath.replaceAll("\\", "/");

  return normalized
    .slice(normalized.lastIndexOf("/") + 1)
    .replace(/\.(json|jsonc)$/i, "")
    .toLowerCase();
}