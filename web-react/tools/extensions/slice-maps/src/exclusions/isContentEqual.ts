import type { NormalizedPaths } from '../types/core.types.ts';


export function isContentEqual(
  prev: NormalizedPaths,
  slice: NormalizedPaths,
): boolean {

  return (
    compareArrays(prev.includeFiles, slice.includeFiles) &&
    compareArrays(prev.includeFolders, slice.includeFolders) &&
    compareArrays(prev.excludeFiles, slice.excludeFiles) &&
    compareArrays(prev.excludeFolders, slice.excludeFolders)
  )
}

export function compareArrays(prev: string[], map: string[]) {
  if (prev.length !== map.length) return false

  const sortedPrev = prev.toSorted((a, b) => a.localeCompare(b))
  const sortedMap = map.toSorted((a, b) => a.localeCompare(b))

  return sortedPrev.every((element, index) =>
    element === sortedMap[index]
  )
}