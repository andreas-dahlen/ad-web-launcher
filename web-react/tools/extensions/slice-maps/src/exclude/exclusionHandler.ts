import type { LoadHandler } from '../loaders/loadHandler.ts';
import type { SliceMap, SliceMapResolution } from '../types/dataStructure.types.ts';
import { createDebug } from '../utils/debug.ts';
import { isContentEqual } from './isContentEqual.ts';
import * as vscode from 'vscode'
import { resolveExclusion } from './resolveExclusion.ts';

export function exclusionHandler(
  loader: LoadHandler,

) {
  const resolutions: SliceMapResolution[] = []
  // const debug = createDebug(output)

  function resolve(map: SliceMap, output: vscode.OutputChannel): Record<string, true> | undefined {
    const debug = createDebug(output, "exclusionHandler")
    const fileTree = loader.fileTree()
    debug('[RESOLVE] got fileTree', fileTree)
    const index = resolutions.findIndex(item => item.id === map.id)
    debug('[RESOLVE] index resolved to', index)
    if (index === -1) {
      debug('[RESOLVE] previous', "doesn't exist")
      const resolvedExclude = resolveExclusion(map, fileTree, output)
      debug('[RESOLVE] next', resolvedExclude)
      resolutions.push({
        ...map,
        includeFiles: [...map.includeFiles],
        includeFolders: [...map.includeFolders],
        excludeFiles: [...map.excludeFiles],
        excludeFolders: [...map.excludeFolders],
        resolvedExclude
      })
      return resolvedExclude
    }

    const prev = resolutions[index]

    if (isContentEqual(prev, map)) return

    debug('[RESOLVE] previous', resolutions[index].resolvedExclude)
    const resolvedExclude = resolveExclusion(map, fileTree, output)
    debug('[RESOLVE] next', resolvedExclude)

    resolutions[index] = {
      ...map,
      includeFiles: [...map.includeFiles],
      includeFolders: [...map.includeFolders],
      excludeFiles: [...map.excludeFiles],
      excludeFolders: [...map.excludeFolders],
      resolvedExclude
    }
    return resolvedExclude
  }

  function getResolution(map: SliceMap, output: vscode.OutputChannel): Record<string, true> | undefined {
    // output.appendLine(`activation fallback [getResolution]: ${JSON.stringify(resolutions.find(res => res.id === map.id)?.resolvedExclude, null, 2)}`)
    void output
    return resolutions.find(res => res.id === map.id)?.resolvedExclude
  }

  return { resolve, getResolution }
}