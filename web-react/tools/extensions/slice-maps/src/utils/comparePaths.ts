import path from 'node:path'
export function isBasePath(basePath: string, pathToCheck: string): boolean {
  const relative = path.relative(basePath, pathToCheck)

  return relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
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