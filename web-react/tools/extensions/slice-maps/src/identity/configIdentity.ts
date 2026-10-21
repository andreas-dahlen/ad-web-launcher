import type { AppStateCache } from '../cache/appStateCache.ts';
import type { SliceCache } from '../cache/sliceMapCache.ts';
import type { ActiveSlice } from '../types/core.types.ts';
import * as vscode from 'vscode'

export type ConfigCache = ReturnType<typeof setUpConfigCache>
export function setUpConfigCache(
  appGet: AppStateCache["appGet"],
  cache: SliceCache,
  context: vscode.ExtensionContext
) {
  let activeConfig: ActiveSlice | undefined

  function checkIdentity(
    input: ActiveSlice | undefined
  ): ActiveSlice | undefined {
    if (!input) return
    const exists = input.type === 'map'
      ? cache.getMapById(input.id)
      : cache.getFilterById(input.id)
    if (exists) return input
  }
  function getPersistedActiveConfig(): ActiveSlice | undefined {
    return context.workspaceState.get<ActiveSlice>('activeConfig')
  }

  function getActiveConfig() {
    return activeConfig
  }

  async function setActiveConfig(configIdentity: ActiveSlice | undefined) {
    activeConfig = configIdentity
    await context.workspaceState.update(
      'activeConfig',
      activeConfig
    )
    await vscode.commands.executeCommand(
      'setContext',
      'sliceMaps.activeType',
      activeConfig?.type
    )
  }

  return {
    getActiveConfig,
    setActiveConfig,
    async resolveConfigIdentity() {

      const fetched = getActiveConfig()
      let identity = checkIdentity(fetched)
      if (identity) return identity

      const loaded = getPersistedActiveConfig()
      identity = checkIdentity(loaded)
      if (identity) {
        await setActiveConfig(identity)
        return identity
      }

      identity = appGet.getActiveMap()
      if (identity) {
        await setActiveConfig(identity)
        return identity
      }

      const activeFilters = appGet.getActiveFilters()
      if (activeFilters.length === 1) {
        await setActiveConfig(activeFilters[0])
        return activeFilters[0]
      }

      const maps = cache.getMaps()
      if (maps.length > 0) {
        identity = { type: maps[0].type, id: maps[0].id }
        await setActiveConfig(identity)
        return identity
      }

      const filters = cache.getFilters()
      identity = filters[0]
        ? { type: filters[0].type, id: filters[0].id }
        : undefined
      await setActiveConfig(identity)
      return identity
    }
  }
}