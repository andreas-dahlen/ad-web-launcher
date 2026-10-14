import { type UUID } from 'node:crypto'
import type { ActiveFilter, ActiveMap, ActiveSlice } from '../types/core.types.ts'
import * as vscode from 'vscode'
import type { ExclusionFileData } from '../types/vscode.types.ts'

export type AppStateCache = NonNullable<ReturnType<typeof createAppStateCache>>
export function createAppStateCache() {
  let activeMap: ActiveMap | undefined
  const activeFilters = new Set<UUID>()
  let activeConfig: ActiveSlice | undefined

  let localExclude: Record<string, boolean> | undefined
  let totalExclude: Record<string, boolean> | undefined

  return {

    hasActiveSlice(): boolean {
      return Boolean(activeMap || activeFilters.size > 0)
    },
    hasActiveFilter(): boolean {
      return activeFilters.size > 0
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
    getActiveFilter(id: UUID): ActiveFilter | undefined {
      if (activeFilters.has(id)) return { type: 'filter', id }
    },
    getActiveFilters(): ActiveFilter[] {
      return [...activeFilters].map(id => ({ type: 'filter', id }))
    },
    getActiveConfig() {
      return activeConfig
    },

    setActiveMap(mapIdentity: ActiveMap | undefined) {
      activeMap = mapIdentity
    },
    setActiveConfig(configIdentity: ActiveSlice | undefined) {
      activeConfig = configIdentity

      void vscode.commands.executeCommand(
        'setContext',
        'sliceMaps.activeType',
        activeConfig?.type
      )
    },


    addActiveFilter(id: UUID) {
      activeFilters.add(id)
    },
    removeActiveFilter(id: UUID) {
      activeFilters.delete(id)
    },


    getLocalExclude(): Record<string, boolean> | undefined {
      return localExclude
    },

    getTotalExclude(): Record<string, boolean> | undefined {
      return totalExclude
    },

    setExcludes({
      total,
      local
    }: ExclusionFileData): void {
      totalExclude = total
      localExclude = local
    }
  }
}