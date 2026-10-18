import type { LoadHandler } from '../loaders/loadHandler.ts';
import type { MergedSlice } from '../types/core.types.ts';
import { isContentEqual } from './isContentEqual.ts';
import * as vscode from 'vscode'
import { resolveExclusion } from './resolveExclusion.ts';
import type { AppStateCache } from '../cache/appStateCache.ts';
import type { MergeCache } from '../cache/mergeCache.ts';

export type ExclusionHandler = NonNullable<ReturnType<typeof exclusionHandler>>
export function exclusionHandler(
  loader: LoadHandler,
  appState: AppStateCache,
  mergeCache: MergeCache
) {

  function resolve(slice: MergedSlice,
    output: vscode.OutputChannel
  ): Record<string, true> {

    const { mergeId, ...sliceData } = slice
    const prev = mergeCache.getCachedMergeData(mergeId)
    const total = appState.getTotalExclude()
    if (!total) return {}
    if (!prev) {
      return runAndUpdate(total, slice, output)
    }
    if (isContentEqual(prev.sliceData, sliceData)) {
      return prev.resolvedExclude
    }
    return runAndUpdate(total, slice, output)
  }

  function runAndUpdate(
    total: Record<string, boolean>,
    slice: MergedSlice,
    output: vscode.OutputChannel
  ): Record<string, true> {
    const { mergeId, ...sliceData } = slice
    const fileTree = loader.fileTree(total)
    const result = resolveExclusion(slice, fileTree, output)
    mergeCache.set(mergeId, { ...result, sliceData })
    return result.resolvedExclude
  }

  return {
    resolve
  }
}