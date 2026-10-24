import path from 'node:path'
import type { ExcludeOrInclude } from '../types/core.types.ts'
export function isChildOf(pathToCheck: string, basePath: string,): boolean {
  const relative = path.relative(basePath, pathToCheck)

  return relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
}

export function hasBasePath(
  paths: Iterable<string>,
  path: string
): boolean {
  for (const basePath of paths) {
    if (isChildOf(path, basePath)) {
      return true
    }
  }

  return false
}

export function isInheriting(
  pathToCheck: string,
  intent: ExcludeOrInclude,
  { excludeFolders, includeFolders }:
    { excludeFolders: Set<string>, includeFolders: Set<string> }
): boolean {
  let resolved: ExcludeOrInclude = 'include'
  let longestMatch = ''

  for (const folder of excludeFolders) {
    if (
      !isChildOf(pathToCheck, folder) ||
      folder.length <= longestMatch.length
    ) continue

    resolved = 'exclude'
    longestMatch = folder
  }

  for (const folder of includeFolders) {
    if (
      !isChildOf(pathToCheck, folder) ||
      folder.length <= longestMatch.length
    ) continue

    resolved = 'include'
    longestMatch = folder
  }

  return resolved === intent
}