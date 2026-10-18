import type { MergedSlice } from '../types/core.types.ts'
import type { CachedMergeData, ResolutionDetails } from '../types/exclusion.types.ts'

export type MergeCache = NonNullable<ReturnType<typeof createMergeCache>>
export function createMergeCache() {
  const cachedMergeData = new Map<string, CachedMergeData>()


  return {
    getMergeSlice(mergeId: string): MergedSlice | undefined {
      const data = cachedMergeData.get(mergeId)
      if (!data) return
      return {
        mergeId,
        ...data.sliceData
      }
    },

    getResolvedExclude(mergeId: string): Record<string, true> | undefined {
      const data = cachedMergeData.get(mergeId)
      if (!data) return
      return data.resolvedExclude
    },

    getDetails(mergeId: string): ResolutionDetails | undefined {
      const data = cachedMergeData.get(mergeId)
      if (!data) return
      return data.details
    },

    getCachedMergeData(mergeId: string
    ): CachedMergeData | undefined {
      return cachedMergeData.get(mergeId)
    },

    set(mergeId: string, input: CachedMergeData) {
      cachedMergeData.set(mergeId, input)
    }
  }
}