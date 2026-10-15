export function isBasePath(basePath: string, path: string): boolean {
  return path.startsWith(`${basePath}/`)
}

export function hasBasePath(
  paths: Set<string>,
  path: string
): boolean {
  for (const basePath of paths) {
    if (isBasePath(basePath, path)) {
      return true
    }
  }

  return false
}