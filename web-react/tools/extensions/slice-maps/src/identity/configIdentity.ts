import type { AppStateCache } from '../cache/appStateCache.ts';
import type { SliceCache } from '../cache/sliceMapCache.ts';
import type { LoadHandler } from '../loaders/loadHandler.ts';
import type { ActiveSlice } from '../types/dataStructure.types.ts';

export async function resolveConfigIdentity(
  appState: AppStateCache,
  cache: SliceCache,
  loader: LoadHandler
): Promise<ActiveSlice | undefined> {
  const fetched = appState.getActiveConfig()
  let identity = checkIdentity(fetched)
  if (identity) return identity

  const loaded = loader.getPersistedActiveConfig()
  identity = checkIdentity(loaded)
  if (identity) {
    appState.setActiveConfig(identity)
    return identity
  }

  identity = appState.getActiveMap()
  if (identity) {
    await update(identity)
    return identity
  }

  const activeFilters = appState.getActiveFilters()
  if (activeFilters.length === 1) {
    await update(activeFilters[0])
    return activeFilters[0]
  }

  const maps = cache.getMaps()
  if (maps.length > 0) {
    identity = { type: maps[0].type, id: maps[0].id }
    await update(identity)
    return identity
  }

  const filters = cache.getFilters()
  identity = filters[0]
    ? { type: filters[0].type, id: filters[0].id }
    : undefined
  await update(identity)
  return identity

  function checkIdentity(
    input: ActiveSlice | undefined
  ): ActiveSlice | undefined {
    if (!input) return
    const exists = input.type === 'map'
      ? cache.getMapById(input.id)
      : cache.getFilterById(input.id)
    if (exists) return input
  }

  async function update(config: ActiveSlice | undefined
  ): Promise<void> {
    appState.setActiveConfig(config)
    await loader.setPersistedActiveConfig(config)
  }
}