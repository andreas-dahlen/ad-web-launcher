import type { AppStateCache } from '../cache/appStateCache.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import type { ActiveSlice } from '../types/dataStructure.types.ts'
import * as vscode from 'vscode'

export async function resolveActiveIdentity(
  appState: AppStateCache,
  cache: SliceCache
): Promise<ActiveSlice | undefined> {
  let identity = appState.getActiveConfig()
  if (identity) return identity

  identity = appState.getActiveMap()
  if (identity) {
    appState.setActiveConfig(identity)
    return identity
  }

  const activeFilters = appState.getActiveFilters()
  if (activeFilters.length === 1) {
    appState.setActiveConfig(activeFilters[0])
    return activeFilters[0]
  }

  const maps = cache.getMaps()

  if (maps.length === 1 && activeFilters.length === 0) {
    identity = { type: 'map', id: maps[0].id }
    appState.setActiveConfig(identity)
    return identity
  }

  const selected = await vscode.window.showQuickPick(
    [...maps, ...cache.getFilters()].map(slice => ({
      label: slice.name,
      description: slice.id,
      identity: { type: slice.type, id: slice.id },
    })),
    { placeHolder: 'Select a Slice' }
  )

  if (!selected) return

  identity = selected.identity
  appState.setActiveConfig(identity)
  return identity
}