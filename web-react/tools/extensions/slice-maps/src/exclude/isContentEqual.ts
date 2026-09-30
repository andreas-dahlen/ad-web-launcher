import type { SliceMap } from '../types/dataStructure.types.ts';


export function isContentEqual(
  prev: SliceMap,
  map: SliceMap,
): boolean {
  const compareArrays = (prev: string[], map: string[]) => {
    if (prev.length !== map.length) return false

    const sortedPrev = prev.toSorted((a, b) => a.localeCompare(b))
    const sortedMap = map.toSorted((a, b) => a.localeCompare(b))

    return sortedPrev.every((element, index) =>
      element === sortedMap[index]
    )
  }

  return (
    compareArrays(prev.files, map.files) &&
    compareArrays(prev.folders, map.folders) &&
    compareArrays(prev.names, map.names)
  )
}