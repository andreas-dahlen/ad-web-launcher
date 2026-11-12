import type { FilterIdentity, MapIdentity } from '../types/core.types.ts'

export function getCurrentMergeId(
  mapId: MapIdentity | undefined,
  filterIds: FilterIdentity[]
): string {

  let constructedId = mapId?.id ?? ''

  const constructedFilterIds = filterIds
    .map(filter => filter.id)
    .toSorted((a, b) => a.localeCompare(b))

  for (const id of constructedFilterIds) {
    constructedId += `.${id}`
  }

  if (constructedId.length === 0) {
    return 'inactive'
  }

  return constructedId
}