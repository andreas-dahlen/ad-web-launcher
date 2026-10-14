import type { LoadHandler } from '../loaders/loadHandler.ts';
import type { MergedSlice, SliceResolution } from '../types/core.types.ts';
import { createDebug } from '../utils/debug.ts';
import { isContentEqual } from './isContentEqual.ts';
import * as vscode from 'vscode'
import { resolveExclusion } from './resolveExclusion.ts';
import type { UUID } from 'node:crypto';
import type { AppStateCache } from '../cache/appStateCache.ts';

export type ExclusionHandler = NonNullable<ReturnType<typeof exclusionHandler>>
export function exclusionHandler(
  loader: LoadHandler,
  appState: AppStateCache
) {
  // const resolutions: SliceResolution[] = []
  const resolutions = new Map<string, SliceResolution>()

  // const debug = createDebug(output)

  function resolve(slice: MergedSlice,
    output: vscode.OutputChannel
  ): Record<string, true> {

    const debug = createDebug(output, "exclusionHandler")
    const prev = resolutions.get(slice.mergeId)
    const total = appState.getTotalExclude()
    if (!total) return {}
    // debug('[RESOLVE] index resolved to', index)
    if (!prev) {
      const fileTree = loader.fileTree(total)
      // debug('[RESOLVE] got fileTree', fileTree)
      debug('[RESOLVE] previous', "doesn't exist")
      const result = resolveExclusion(slice, fileTree, output)
      debug('[RESOLVE] next', result.resolvedExclude)
      resolutions.set(slice.mergeId, {
        mergeId: slice.mergeId,
        includeFiles: [...slice.includeFiles],
        includeFolders: [...slice.includeFolders],
        excludeFiles: [...slice.excludeFiles],
        excludeFolders: [...slice.excludeFolders],
        ...result
      })
      return result.resolvedExclude
    }

    if (isContentEqual(prev, slice)) {
      return prev.resolvedExclude
    }
    const fileTree = loader.fileTree(total)
    debug('[RESOLVE] previous', prev.resolvedExclude)
    const result = resolveExclusion(slice, fileTree, output)
    debug('[RESOLVE] next', result.resolvedExclude)

    resolutions.set(slice.mergeId, {
      mergeId: slice.mergeId,
      includeFiles: [...slice.includeFiles],
      includeFolders: [...slice.includeFolders],
      excludeFiles: [...slice.excludeFiles],
      excludeFolders: [...slice.excludeFolders],
      ...result
    })
    return result.resolvedExclude
  }

  function getResolutionByMergeId(
    mergeId: string
  ): SliceResolution | undefined {

    return resolutions.get(mergeId)
  }

  function getResolutions() {
    return resolutions
  }

  function invalidate(): void {
    resolutions.clear()
    //TODO needs a hookup to 
    // const watcher = vscode.workspace.createFileSystemWatcher(
    //   new vscode.RelativePattern(root, '**/*')
    // )

    // watcher.onDidCreate(handleStructureChange)
    // watcher.onDidDelete(handleStructureChange)

    //so find all places where exclusions can be added... workspace config, .vscode settings.... wherever and think about fetch/watch and integration.
  }

  function invalidateResolutionByMergeId(mergeId: string | UUID) {
    resolutions.delete(mergeId)
  }

  return {
    resolve,
    getResolutionByMergeId,
    getResolutions,
    invalidate,
    invalidateResolutionByMergeId
  }
}