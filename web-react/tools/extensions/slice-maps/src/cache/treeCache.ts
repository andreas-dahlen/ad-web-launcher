import type { UUID } from 'node:crypto'
import type { ConfigCache } from '../identity/configIdentity.ts'
import type { TreeCacheEntry, WorkspaceDisplayMode } from '../types/core.types.ts'
import type { AppStateCache } from './appStateCache.ts'
import { throwError } from '../utils/throwError.ts'

export type TreeCache = NonNullable<ReturnType<typeof createTreeCache>>


export function createTreeCache(appGet: AppStateCache["appGet"], conf: ConfigCache) {
  const activeSliceData = new Map<string, TreeCacheEntry>()
  const activeConfigData = new Map<UUID, TreeCacheEntry>()

  let displayMode: WorkspaceDisplayMode = 'effective'
  let hasInactiveSliceData: boolean = false

  return {
    getTreeNodes() {
      if (displayMode === 'effective') {
        const mergeId = appGet.getActiveMergeId()
        return activeSliceData.get(mergeId)?.nodeData
      }

      const activeConfig = conf.getActiveConfig()
      if (!activeConfig) throwError('active config is undefined')

      return activeConfigData.get(activeConfig.id)?.nodeData
    },

    getSliceDataById(mergeId: string) {
      return activeSliceData.get(mergeId)?.sliceData
    },
    setSliceData(mergeId: string, data: TreeCacheEntry) {
      activeSliceData.set(mergeId, data)
    },
    checkHasInactiveSlideData() {
      const isInitiated = hasInactiveSliceData
      hasInactiveSliceData = true
      return isInitiated
    },

    getConfigDataById(activeConfigId: UUID) {
      return activeConfigData.get(activeConfigId)?.sliceData
    },
    setConfigData(configId: UUID, data: TreeCacheEntry) {
      activeConfigData.set(configId, data)
    },

    changeDisplayMode(mode?: WorkspaceDisplayMode) {
      if (mode) {
        displayMode = mode
        return
      }
      displayMode = displayMode === 'effective'
        ? 'configuration'
        : 'effective'
    },
    getDisplayMode() {
      return displayMode
    }
  }
}
