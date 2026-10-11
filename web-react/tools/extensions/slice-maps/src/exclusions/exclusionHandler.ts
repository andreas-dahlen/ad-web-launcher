import type { LoadHandler } from '../loaders/loadHandler.ts';
import type { MergedSlice, SliceResolution } from '../types/dataStructure.types.ts';
import { createDebug } from '../utils/debug.ts';
import { isContentEqual } from './isContentEqual.ts';
import * as vscode from 'vscode'
import { resolveExclusion } from './resolveExclusion.ts';


export type ExclusionHandler = NonNullable<ReturnType<typeof exclusionHandler>>
export function exclusionHandler(
  loader: LoadHandler
) {
  // const resolutions: SliceResolution[] = []
  const resolutions = new Map<string, SliceResolution>()

  // const debug = createDebug(output)

  function resolve(slice: MergedSlice,
    output: vscode.OutputChannel
  ): Record<string, true> {

    const debug = createDebug(output, "exclusionHandler")
    const prev = resolutions.get(slice.mergeId)
    // debug('[RESOLVE] index resolved to', index)
    if (!prev) {
      const fileTree = loader.fileTree()
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
    const fileTree = loader.fileTree()
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
  }

  return { resolve, getResolutionByMergeId, getResolutions, invalidate }
}