import type { LoadHandler } from '../loaders/loadHandler.ts';
import type { SliceMap, SliceMapResolution } from '../types/dataStructure.types.ts';
import { createResolution } from './createResolution.ts';
import { isContentEqual } from './isContentEqual.ts';
import { isResolutionEqual } from './isResolutionEqual.ts';

export function exclusionHandler(
  loader: LoadHandler
) {
  const resolutions: SliceMapResolution[] = []

  function resolve(map: SliceMap): Record<string, true> | undefined {

    const fileTree = loader.fileTree()
    const index = resolutions.findIndex(item => item.id === map.id)

    if (index === -1) {
      const resolvedExclude = createResolution(map, fileTree)
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

    const resolvedExclude = createResolution(map, fileTree)

    const isEqual = isResolutionEqual(
      resolutions[index].resolvedExclude,
      resolvedExclude
    )

    resolutions[index] = {
      ...map,
      includeFiles: [...map.includeFiles],
      includeFolders: [...map.includeFolders],
      excludeFiles: [...map.excludeFiles],
      excludeFolders: [...map.excludeFolders],
      resolvedExclude
    }

    if (isEqual) return
    return resolvedExclude
  }

  function getResolution(map: SliceMap): Record<string, true> | undefined {
    return resolutions.find(res => res.id === map.id)?.resolvedExclude
  }

  return { resolve, getResolution }
}