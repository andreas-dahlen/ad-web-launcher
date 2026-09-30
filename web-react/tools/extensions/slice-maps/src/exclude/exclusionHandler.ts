import type { LoadHandler } from '../loaders/loadHandler.ts';
import type { SliceMap, SliceMapResolution } from '../types/dataStructure.types.ts';
import { createResolution } from './createResolution.ts';
import { isContentEqual } from './isContentEqual.ts';

export function exclusionHandler(
  loader: LoadHandler
) {
  const resolutions: SliceMapResolution[] = []

  function resolve(map: SliceMap): Map<string, boolean> {

    const fileTree = loader.fileTree()

    const foundIndex = resolutions.findIndex(item => item.id === map.id)

    if (foundIndex === -1) {
      const resolvedExclude = createResolution(map, fileTree)
      resolutions.push({ ...map, resolvedExclude })
      return resolvedExclude

    }

    const prev = resolutions[foundIndex]

    if (isContentEqual(prev, map)) {
      return prev.resolvedExclude
    }

    //TODO should obviously be a new function. Or refractored
    const resolvedExclude = createResolution(map, fileTree)
    resolutions[foundIndex] = { ...map, resolvedExclude }

    return resolvedExclude
  }
  return { resolve }
}