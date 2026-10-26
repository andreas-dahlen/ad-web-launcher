import type { WorkspaceTreeNode } from '../types/core.types.ts'
import type { AppStateCache } from './appStateCache.ts'

export type TreeCache = NonNullable<ReturnType<typeof createTreeCache>>

export function createTreeCache(appGet: AppStateCache["appGet"]) {
  const data = new Map<string, WorkspaceTreeNode[]>()

  return {
    getActiveData() {
      const mergeId = appGet.getActiveMergeId()

      return data.get(mergeId)
    },

    getDataById(mergeId: string) {
      return data.get(mergeId)
    },

    setData(mergeId: string, visualTree: WorkspaceTreeNode[]) {
      data.set(mergeId, visualTree)
    }
  }
}
