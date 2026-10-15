import type { MergedSlice, SliceResolution } from '../types/core.types.ts';


export function isContentEqual(
  prev: SliceResolution,
  map: MergedSlice,
): boolean {

  return (
    compareArrays(prev.includeFiles, map.includeFiles) &&
    compareArrays(prev.includeFolders, map.includeFolders) &&
    compareArrays(prev.excludeFiles, map.excludeFiles) &&
    compareArrays(prev.excludeFolders, map.excludeFolders)
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