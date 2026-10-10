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
  const resolutions: SliceResolution[] = []
  //TODO new Map<mergedId, SliceResolution>

  // const debug = createDebug(output)

  function resolve(slice: MergedSlice,
    output: vscode.OutputChannel
  ): Record<string, true> {

    const debug = createDebug(output, "exclusionHandler")
    const index = resolutions.findIndex(item => item.mergeId === slice.mergeId)
    debug('[RESOLVE] index resolved to', index)
    if (index === -1) {
      const fileTree = loader.fileTree()
      // debug('[RESOLVE] got fileTree', fileTree)
      debug('[RESOLVE] previous', "doesn't exist")
      const resolvedExclude = resolveExclusion(slice, fileTree, output)
      debug('[RESOLVE] next', resolvedExclude)
      resolutions.push({
        mergeId: slice.mergeId,
        includeFiles: [...slice.includeFiles],
        includeFolders: [...slice.includeFolders],
        excludeFiles: [...slice.excludeFiles],
        excludeFolders: [...slice.excludeFolders],
        resolvedExclude
      })
      return resolvedExclude
    }

    const prev = resolutions[index]

    if (isContentEqual(prev, slice)) {
      return prev.resolvedExclude
    }
    const fileTree = loader.fileTree()
    debug('[RESOLVE] previous', resolutions[index].resolvedExclude)
    const resolvedExclude = resolveExclusion(slice, fileTree, output)
    debug('[RESOLVE] next', resolvedExclude)

    resolutions[index] = {
      mergeId: slice.mergeId,
      includeFiles: [...slice.includeFiles],
      includeFolders: [...slice.includeFolders],
      excludeFiles: [...slice.excludeFiles],
      excludeFolders: [...slice.excludeFolders],
      resolvedExclude
    }
    return resolvedExclude
  }

  return { resolve }
}