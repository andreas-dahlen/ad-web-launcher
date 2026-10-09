import type { UUID } from 'node:crypto'
import type { AppStateCache } from '../cache/appStateCache.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import { requestSlice } from './requestSlice.ts'

export async function resolveActiveIdentity(
  appState: AppStateCache,
  cache: SliceCache
): Promise<UUID | undefined> {
  let identity = appState.getActiveConfig()
  if (identity) return identity.id

  const maps = cache.getMaps()
  const filters = cache.getFilters()

  if (maps.length === 1) {
    identity = { type: 'map', id: maps[0].id }
  } else {
    const newIdentity = await requestSlice(maps, filters)
    if (!newIdentity) return
    identity = newIdentity
  }
  appState.setActiveConfig(identity)
  return identity.id
}