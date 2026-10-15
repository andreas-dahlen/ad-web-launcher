import type { WorkspaceTreeNode } from '../types/core.types.ts'

export type VisualCache = NonNullable<ReturnType<typeof createVisualCache>>

export function createVisualCache() {
  const data = new Map<string, WorkspaceTreeNode[]>()

  let activeMergeId = 'inactive'

  return {
    getActiveData() {
      return data.get(activeMergeId)
    },

    getDataById(mergeId: string) {
      return data.get(mergeId)
    },

    setData(mergeId: string, visualTree: WorkspaceTreeNode[]) {
      data.set(mergeId, visualTree)
    },

    setActive(mergeId: string) {
      activeMergeId = mergeId
    }
  }
}
