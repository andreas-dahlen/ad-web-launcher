import type { LoadTree } from '../loaders/loadTree.ts';
import type { MergedSlice } from '../types/core.types.ts';
import { isContentEqual } from './isContentEqual.ts';
import { resolveExclusion } from './resolveExclusion.ts';
import type { MergeCache } from '../cache/mergeCache.ts';

export type ExclusionHandler = ReturnType<typeof exclusionHandler>
export function exclusionHandler(
  loadTree: LoadTree,
  mergeCache: MergeCache
) {

  function resolve(
    slice: MergedSlice
  ): Record<string, true> {
    const { mergeId, ...sliceData } = slice
    const prev = mergeCache.getCachedMergeData(mergeId)
    if (!prev) {
      return runAndUpdate(slice)
    }
    if (isContentEqual(prev.sliceData, sliceData)) {
      return prev.resolvedExclude
    }
    return runAndUpdate(slice)
  }

  function runAndUpdate(
    slice: MergedSlice,
  ): Record<string, true> {
    const { mergeId, ...sliceData } = slice
    const fileTree = loadTree.build()
    const result = resolveExclusion(slice, fileTree)
    mergeCache.set(mergeId, { ...result, sliceData })
    return result.resolvedExclude
  }

  return {
    resolve
  }
}