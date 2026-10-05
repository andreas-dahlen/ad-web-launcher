import type { SliceMap } from '../types/dataStructure.types.ts'
export function resetMap(
  map: SliceMap
): SliceMap {

  return {
    id: map.id,
    name: map.name,
    includeFiles: [],
    includeFolders: [],
    excludeFiles: [],
    excludeFolders: []
  }
}