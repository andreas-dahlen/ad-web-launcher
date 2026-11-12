import type { AppStateCache } from '../cache/appStateCache.ts';
import type { SliceCache } from '../cache/sliceMapCache.ts';
import type { ActiveConfigChanged, ActiveSlice } from '../types/core.types.ts';
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

  async function doesChangeActiveConfig(configIdentity: ActiveSlice | undefined): Promise<boolean> {
    const hasChanged =
      activeConfig?.id !== configIdentity?.id ||
      activeConfig?.type !== configIdentity?.type

    if (!hasChanged) return false

    activeConfig = configIdentity

    await vscode.commands.executeCommand(
      'setContext',
      'sliceMaps.activeType',
      activeConfig?.type
    )

    await context.workspaceState.update(
      'activeConfig',
      activeConfig
    )

    return true
  }

  return {
    getActiveConfig,
    doesChangeActiveConfig,

    async resolveConfigIdentity(): Promise<ActiveConfigChanged> {
      const fetched = getActiveConfig()

      let requiresUpdate: boolean = false
      let activeIdentity = checkIdentity(fetched)
      if (activeIdentity) return { activeIdentity, requiresUpdate }

      const loaded = getPersistedActiveConfig()
      activeIdentity = checkIdentity(loaded)
      if (activeIdentity) {
        requiresUpdate = await doesChangeActiveConfig(activeIdentity)
        return { activeIdentity, requiresUpdate }
      }

      activeIdentity = appGet.getActiveMap()
      if (activeIdentity) {
        requiresUpdate = await doesChangeActiveConfig(activeIdentity)
        return { activeIdentity, requiresUpdate }
      }

      const activeFilters = appGet.getActiveFilters()
      if (activeFilters.length === 1) {
        requiresUpdate = await doesChangeActiveConfig(activeFilters[0])
        return { activeIdentity: activeFilters[0], requiresUpdate }
      }

      const maps = cache.getMaps()
      if (maps.length > 0) {
        activeIdentity = { type: maps[0].type, id: maps[0].id }
        requiresUpdate = await doesChangeActiveConfig(activeIdentity)
        return { activeIdentity, requiresUpdate }
      }

      const filters = cache.getFilters()
      activeIdentity = filters[0]
        ? { type: filters[0].type, id: filters[0].id }
        : undefined
      requiresUpdate = await doesChangeActiveConfig(activeIdentity)
      if (!activeIdentity) return { requiresUpdate }
      return { activeIdentity, requiresUpdate }
    }
  }
}