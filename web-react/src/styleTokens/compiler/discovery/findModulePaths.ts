import resolveTokenGroup from "../resolvers/resolveTokenGroup.ts";
import findCssModulePath from "./findCssModulePath.ts";

export default function findModulePaths(
  tokenPaths: string[],
): Map<string, string> {
  const cssMap = new Map<string, string>();

  const groups = new Set(
    tokenPaths.map(resolveTokenGroup),
  );

  for (const groupPath of groups) {
    const cssPath = findCssModulePath(groupPath);

    if (cssPath) {
      cssMap.set(groupPath, cssPath);
    }
  }

  return cssMap;
}