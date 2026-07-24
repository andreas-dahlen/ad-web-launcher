import fs from "node:fs";
import path from "node:path";

export default function findCssModulePath(
  groupPath: string,
): string | undefined {
  const cssModules = findCssModules(
    path.resolve("./src"),
  );

  const groupName = extractName(groupPath);

  return cssModules.find(file => {
    const name = path
      .basename(file, ".module.css")
      .toLowerCase();

    return name === groupName;
  });
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