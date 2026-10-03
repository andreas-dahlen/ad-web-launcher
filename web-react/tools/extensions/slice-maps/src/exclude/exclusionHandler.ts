import type { LoadHandler } from '../loaders/loadHandler.ts';
import type { SliceMap, SliceMapResolution } from '../types/dataStructure.types.ts';
import { createDebug } from '../utils/debug.ts';
import { isContentEqual } from './isContentEqual.ts';
import * as vscode from 'vscode'
import { newResolution } from './newResolutionHandler.ts';

export function exclusionHandler(
  loader: LoadHandler,

) {
  const resolutions: SliceMapResolution[] = []
  // const debug = createDebug(output)

  function resolve(map: SliceMap, output: vscode.OutputChannel): Record<string, true> | undefined {
    const debug = createDebug(output)
    const fileTree = loader.fileTree()
    const index = resolutions.findIndex(item => item.id === map.id)
    // output.appendLine("hello!")
    if (index === -1) {
      const resolvedExclude = newResolution(map, fileTree, output)
      debug('[RESOLVE]', resolvedExclude)
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
    const resolvedExclude = newResolution(map, fileTree, output)
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
    output.appendLine(`activation fallback [getResolution]: ${JSON.stringify(resolutions.find(res => res.id === map.id)?.resolvedExclude, null, 2)}`)
    return resolutions.find(res => res.id === map.id)?.resolvedExclude
  }

  return { resolve, getResolution }
}