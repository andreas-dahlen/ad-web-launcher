import type { LoadTree } from '../loaders/loadTree.ts';
import type { MergedSlice } from '../types/core.types.ts';
import { isContentEqual } from './isContentEqual.ts';
import { resolveExclusion } from './resolveExclusion.ts';
import type { MergeCache } from '../cache/mergeCache.ts';
import type { NativeBackupHandler } from '../core/nativeBackupHandler.ts';

export type ExclusionHandler = NonNullable<ReturnType<typeof exclusionHandler>>
export function exclusionHandler(
  loadTree: LoadTree,
  backup: NativeBackupHandler,
  mergeCache: MergeCache
) {

  function resolve(slice: MergedSlice,
  ): Record<string, true> {

    const { mergeId, ...sliceData } = slice
    const prev = mergeCache.getCachedMergeData(mergeId)
    const total = backup.getTotalExclude()
    if (!total) return {}
    if (!prev) {
      return runAndUpdate(total, slice)
    }
    if (isContentEqual(prev.sliceData, sliceData)) {
      return prev.resolvedExclude
    }
    return runAndUpdate(total, slice)
  }

  function runAndUpdate(
    total: Record<string, boolean>,
    slice: MergedSlice,
  ): Record<string, true> {
    const { mergeId, ...sliceData } = slice
    const fileTree = loadTree.build(total)
    const result = resolveExclusion(slice, fileTree)
    mergeCache.set(mergeId, { ...result, sliceData })
    return result.resolvedExclude
  }

  return {
    resolve
  }
}