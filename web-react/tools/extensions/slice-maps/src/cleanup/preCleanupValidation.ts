import type { MergeCache } from '../cache/mergeCache.ts'
import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts'
import { compareArrays, isContentEqual } from '../exclusions/isContentEqual.ts'
import type { MergedSlice, Slice } from '../types/core.types.ts'
import type { CachedMergeData } from '../types/exclusion.types.ts'
import { throwError } from '../utils/throwError.ts'

export function createCleanupValidator(
  slice: Slice,
  mergeCache: MergeCache,
  excluder: ExclusionHandler
) {

  function validateCacheData(): {
    prev: CachedMergeData,
    inputSlice: MergedSlice
  } {

    const isMap = slice.type === 'map'

    const inputSlice: MergedSlice = {
      mergeId: slice.id,
      excludeFiles: slice.excludeFiles,
      excludeFolders: slice.excludeFolders,
      includeFiles: isMap ? slice.includeFiles : [],
      includeFolders: isMap ? slice.includeFolders : []
    }

    let prev = mergeCache.getCachedMergeData(slice.id)

    if (!prev || !isContentEqual(prev.sliceData, inputSlice)) {
      excluder.resolve(inputSlice)
      prev = mergeCache.getCachedMergeData(slice.id)

      if (!prev) throwError('Cannot compress: could not resolve cached data for slice.')

    }
    return { prev, inputSlice }
  }

  function isValidOutput(
    prev: CachedMergeData,
    newSlice: MergedSlice,
    inputSlice: MergedSlice
  ): boolean {

    if (isContentEqual(newSlice, inputSlice)) return false
    const prevResult = Object.keys(prev.resolvedExclude)

    const newExclude = excluder.resolve(newSlice, true)
    const newResult = Object.keys(newExclude)

    if (!compareArrays(prevResult, newResult)) {
      throwError('Cannot compress: error, compression would change the resolved exclusions.')
    }
    return true
  }

  return { validateCacheData, isValidOutput }
}