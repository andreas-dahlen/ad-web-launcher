import { type UUID } from 'node:crypto'
import type { ActiveFilter, ActiveMap } from '../types/core.types.ts'
import { getCurrentMergeId } from '../normalize/mergeId.ts'

export type AppStateCache = NonNullable<ReturnType<typeof createAppStateCache>>
export function createAppStateCache() {
  let activeMap: ActiveMap | undefined
  const activeFilters = new Set<UUID>()

  function getActiveFilters(): ActiveFilter[] {
    return [...activeFilters].map(id => ({ type: 'filter', id }))
  }

  const appGet = {
    hasActiveSlice(): boolean {
      return Boolean(activeMap || activeFilters.size > 0)
    },

    isActiveMap(id: UUID): boolean {
      return activeMap?.id === id
    },
    isActiveFilter(id: UUID): boolean {
      return activeFilters.has(id)
    },
    getActiveMap() {
      return activeMap
    },
    getActiveFilters,

    getActiveMergeId(): string {
      return getCurrentMergeId(activeMap, getActiveFilters())
    },
  }

  const appSet = {
    addActiveFilter(id: UUID) {
      activeFilters.add(id)
    },
    removeActiveFilter(id: UUID) {
      activeFilters.delete(id)
    },
    clearActiveFilters() {
      activeFilters.clear()
    },

    setActiveMap(mapIdentity: ActiveMap | undefined) {
      activeMap = mapIdentity
    }
  }

  return {
    appSet,
    appGet
  }
}