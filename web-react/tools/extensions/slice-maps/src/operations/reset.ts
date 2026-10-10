import type { SliceFilter, SliceMap } from '../types/dataStructure.types.ts'
export function resetMap(
  map: SliceMap
): SliceMap {

  return {
    type: map.type,
    id: map.id,
    name: map.name,
    includeFiles: [],
    includeFolders: [],
    excludeFiles: [],
    excludeFolders: []
  }
}
export function resetFilter(
  filter: SliceFilter
): SliceFilter {

  return {
    type: filter.type,
    id: filter.id,
    name: filter.name,
    excludeFiles: [],
    excludeFolders: []
  }
}