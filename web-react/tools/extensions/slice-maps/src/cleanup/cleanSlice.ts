import type { MergeCache } from '../cache/mergeCache.ts'
import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts'
import type { ExcludeOrInclude, NormalizedPaths, Slice } from '../types/core.types.ts'
import type { CachedMergeData } from '../types/exclusion.types.ts'
import { createCleanupValidator } from './preCleanupValidation.ts'

export function cleanSlice(
  slice: Slice,
  mergeCache: MergeCache,
  excluder: ExclusionHandler,
): Slice | undefined {

  const validator = createCleanupValidator(slice, mergeCache, excluder)

  const { prev, inputSlice } = validator.validateCacheData()

  const newNorm = reduceAll(prev)

  const newSlice = { ...newNorm, mergeId: slice.id }

  const isValid = validator.isValidOutput(prev, newSlice, inputSlice)

  if (!isValid) return

  if (slice.type === 'map') {
    return {
      ...slice,
      ...newNorm
    }
  }

  return {
    ...slice,
    excludeFiles: newSlice.excludeFiles,
    excludeFolders: newSlice.excludeFolders
  }
}

function reduceAll(
  data: CachedMergeData,
): NormalizedPaths {

  const { sliceData, details } = data
  const { completeExclude, baseTruth } = details

  const includeFiles = new Set<string>(sliceData.includeFiles)
  const includeFolders = new Set<string>(sliceData.includeFolders)
  const excludeFiles = new Set(sliceData.excludeFiles)
  const excludeFolders = new Set(sliceData.excludeFolders)

  const isDeletable = (path: string, expected: ExcludeOrInclude): boolean => {
    return completeExclude.get(path) === expected
      && baseTruth.get(path)?.implicit === expected
  }
  for (const file of includeFiles) {
    if (isDeletable(file, 'include'))
      includeFiles.delete(file)
  }
  for (const folder of includeFolders) {
    if (isDeletable(folder, 'include'))
      includeFolders.delete(folder)
  }
  for (const file of excludeFiles) {
    if (isDeletable(file, 'exclude'))
      excludeFiles.delete(file)
  }
  for (const folder of excludeFolders) {
    if (isDeletable(folder, 'exclude'))
      excludeFolders.delete(folder)
  }

  return {
    includeFiles: [...includeFiles],
    includeFolders: [...includeFolders],
    excludeFiles: [...excludeFiles],
    excludeFolders: [...excludeFolders],
  }
}