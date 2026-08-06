import { extractGroupName } from '../resolvers/extractGroupName.ts';
import fs from "node:fs";
import path from "node:path";

export function createModuleMap(
  groupPaths: string[],
): Map<string, string> {
  const cssPaths = findCssModules(path.resolve("./src")); //TODO make it safer? might resolve incorrectly? needs robustness?

  const cssMap = new Map<string, string>();

  for (const groupPath of groupPaths) {
    const cssPath = resolveCssFromGroup(
      groupPath,
      cssPaths,
    );

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

function resolveCssFromGroup(
  groupPath: string,
  cssPaths: string[],
): string | undefined {
  const groupName = extractGroupName(groupPath).toLowerCase();

  return cssPaths.find(cssPath =>
    path.basename(cssPath, ".module.css").toLowerCase() === groupName
  );
}