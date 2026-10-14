import type { VisualTreeNode } from '../types/core.types.ts'

export type VisualCache = NonNullable<ReturnType<typeof createVisualCache>>

export function createVisualCache() {
  const data = new Map<string, VisualTreeNode[]>()

  let activeMergeId = 'inactive'

  return {
    getActiveData() {
      return data.get(activeMergeId)
    },

    getDataById(mergeId: string) {
      return data.get(mergeId)
    },

    setData(mergeId: string, visualTree: VisualTreeNode[]) {
      data.set(mergeId, visualTree)
    },

    setActive(mergeId: string) {
      activeMergeId = mergeId
    }
  }
}
