import type { AppStateCache } from '../cache/appStateCache.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import type { MergedSlice } from '../types/core.types.ts'

export function mergeSlice(
  sliceCache: SliceCache,
  appState: AppStateCache
): MergedSlice {
  const activeMapIdentity = appState.getActiveMap()
  const activeFiltersIdentities = appState.getActiveFilters()

  const includeFiles = new Set<string>()
  const includeFolders = new Set<string>()
  const excludeFiles = new Set<string>()
  const excludeFolders = new Set<string>()

  const mergeId = appState.getActiveMergeId()

  //// Safe to merge: filters only exclude, and includes take priority in resolveExclusion.
  if (activeMapIdentity) {
    const map = sliceCache.getMapById(activeMapIdentity.id)
    map?.includeFiles.forEach(include => includeFiles.add(include))
    map?.includeFolders.forEach(include => includeFolders.add(include))
    map?.excludeFiles.forEach(exclude => excludeFiles.add(exclude))
    map?.excludeFolders.forEach(exclude => excludeFolders.add(exclude))
  }
  for (const activeFilter of activeFiltersIdentities) {
    const filter = sliceCache.getFilterById(activeFilter.id)
    filter?.excludeFiles.forEach(exclude => excludeFiles.add(exclude))
    filter?.excludeFolders.forEach(exclude => excludeFolders.add(exclude))
  }
  return {
    mergeId,
    includeFiles: [...includeFiles],
    includeFolders: [...includeFolders],
    excludeFiles: [...excludeFiles],
    excludeFolders: [...excludeFolders]
  }
}