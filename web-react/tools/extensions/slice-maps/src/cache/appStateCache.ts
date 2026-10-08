import { type UUID } from 'node:crypto'
import type { ActiveFilter, ActiveMap, ActiveSlice } from '../types/dataStructure.types.ts'
import * as vscode from 'vscode'

export type AppStateCache = NonNullable<ReturnType<typeof createAppStateCache>>
export function createAppStateCache() {
  let activeMap: ActiveMap | undefined
  const activeFilters = new Set<UUID>()
  let activeConfig: ActiveSlice | undefined
  // let localExclude: Record<string, boolean> | undefined

  return {

    hasActiveSlice(): boolean {
      return Boolean(activeMap || activeFilters.size > 0);
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

    // getLocalExclude() {
    //   return localExclude
    // },


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
    // setLocalExclude(exclude: Record<string, boolean> | undefined) {
    //   localExclude = exclude
    // },
    addActiveFilter(id: UUID) {
      activeFilters.add(id)
    },
    removeActiveFilter(id: UUID) {
      activeFilters.delete(id)
    }
  }
}