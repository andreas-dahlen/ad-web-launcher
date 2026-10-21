import type { UUID } from 'node:crypto'
import type { SliceData, SliceFilter, SliceMap } from '../types/core.types.ts'
import * as vscode from 'vscode'
export type SliceCache = NonNullable<ReturnType<typeof createSliceMapCache>>

export function createSliceMapCache(
  context: vscode.ExtensionContext
) {

  const sliceData = getPersistedSliceData(context)

  const maps = new Map<UUID, SliceMap>(
    sliceData.maps.map(map => [map.id, map])
  )

  const filters = new Map<UUID, SliceFilter>(
    sliceData.filters.map(filter => [filter.id, filter])
  )

  async function persist(): Promise<void> {
    await setPersistedSliceData({
      maps: maps.values().toArray(),
      filters: filters.values().toArray()
    }, context)
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

  return {

    getMaps,
    getMapById,
    addMap,
    removeMap,
    renameMap,

    getFilters,
    getFilterById,
    addFilter,
    removeFilter,
    renameFilter
  }
}

function getPersistedSliceData(context: vscode.ExtensionContext): SliceData {
  return context.workspaceState.get<SliceData>('sliceMaps') ?? {
    maps: [],
    filters: []
  }
}

async function setPersistedSliceData(data: SliceData, context: vscode.ExtensionContext): Promise<void> {
  await context.workspaceState.update(
    'sliceMaps',
    data
  )
}