import * as vscode from 'vscode'
import type { UUID } from 'node:crypto'
import type { MergedSlice, SliceData, SliceFilter, SliceMap } from '../types/dataStructure.types.ts'
import type { AppStateCache } from './appStateCache.ts'

export type SliceCache = NonNullable<ReturnType<typeof createSliceMapCache>>

export function createSliceMapCache(
  context: vscode.ExtensionContext,
  sliceData: SliceData,
  appState: AppStateCache,
  output: vscode.OutputChannel
) {

  void output

  // output.appendLine(
  //   `[cache] sliceData: ${JSON.stringify(sliceData)}`
  // )

  const maps = new Map<UUID, SliceMap>(
    sliceData.maps.map(map => [map.id, map])
  )

  // output.appendLine(
  //   `[cache] 1`
  // )

  const filters = new Map<UUID, SliceFilter>(
    sliceData.filters.map(filter => [filter.id, filter])
  )

  // output.appendLine(
  //   `[cache] 2`
  // )

  function getEffectiveSlice(): MergedSlice {
    const activeMapIdentity = appState.getActiveMap()
    const activeFiltersIdentities = appState.getActiveFilters()

    const includeFiles = new Set<string>()
    const includeFolders = new Set<string>()

    const excludeFiles = new Set<string>()
    const excludeFolders = new Set<string>()
    // const excludePatterns = new Set<string>()


    let mergeId = activeMapIdentity?.id ?? ''


    const filterIds = activeFiltersIdentities
      .map(filter => filter.id)
      .toSorted((a, b) => a.localeCompare(b))

    for (const id of filterIds) {
      mergeId += `.${id}`
    }

    if (activeMapIdentity) {
      const map = getMapById(activeMapIdentity.id)
      map?.includeFiles.forEach(include => includeFiles.add(include))
      map?.includeFolders.forEach(include => includeFolders.add(include))
      map?.excludeFiles.forEach(exclude => excludeFiles.add(exclude))
      map?.excludeFolders.forEach(exclude => excludeFolders.add(exclude))
    }

    for (const activeFilter of activeFiltersIdentities) {
      const filter = getFilterById(activeFilter.id)
      filter?.excludeFiles.forEach(exclude => excludeFiles.add(exclude))
      filter?.excludeFolders.forEach(exclude => excludeFolders.add(exclude))
      // filter?.excludePatterns.forEach(exclude => excludePatterns.add(exclude))
    }

    return {
      mergeId,
      includeFiles: [...includeFiles],
      includeFolders: [...includeFolders],
      excludeFiles: [...excludeFiles],
      excludeFolders: [...excludeFolders]
    }
  }


  async function persist(): Promise<void> {
    await context.workspaceState.update('sliceMaps', {
      maps: maps.values().toArray(),
      filters: filters.values().toArray()
    })
  }

  function getMaps(): SliceMap[] {
    return maps.values().toArray()
  }

  function getMapById(id: UUID): SliceMap | null {
    return maps.get(id) ?? null
  }

  async function addMap(map: SliceMap): Promise<void> {
    maps.set(map.id, map)
    await persist()
  }

  async function removeMap(id: UUID): Promise<void> {
    maps.delete(id)
    await persist()
  }

  async function renameMap(id: UUID, name: string): Promise<void> {
    const map = maps.get(id)
    if (!map) return

    map.name = name
    await persist()
  }


  function getFilters(): SliceFilter[] {
    return filters.values().toArray()
  }

  function getFilterById(id: UUID): SliceFilter | null {
    return filters.get(id) ?? null
  }

  async function addFilter(filter: SliceFilter): Promise<void> {
    filters.set(filter.id, filter)
    await persist()
  }

  async function removeFilter(id: UUID): Promise<void> {
    filters.delete(id)
    await persist()
  }

  async function renameFilter(id: UUID, name: string): Promise<void> {
    const filter = filters.get(id)
    if (!filter) return

    filter.name = name
    await persist()
  }



  function getRecoveryExclude(): Record<string, boolean> | undefined {
    return context.workspaceState.get<Record<string, boolean>>('localExclude')
  }
  async function setRecoveryExclude(exclude: Record<string, boolean> | undefined): Promise<void> {
    await context.workspaceState.update(
      'localExclude',
      exclude
    )
  }

  let localExclude: Record<string, boolean> | undefined

  function getLocalExclude(): Record<string, boolean> | undefined {
    return localExclude
  }

  function setLocalExclude(exclude: Record<string, boolean> | undefined): void {
    localExclude = exclude
  }

  return {
    getEffectiveSlice,

    getMaps,
    getMapById,
    addMap,
    removeMap,
    // replaceMap,
    renameMap,

    getFilters,
    getFilterById,
    addFilter,
    removeFilter,
    // replaceFilter,
    renameFilter,


    getRecoveryExclude,
    setRecoveryExclude,

    getLocalExclude,
    setLocalExclude
  }
}