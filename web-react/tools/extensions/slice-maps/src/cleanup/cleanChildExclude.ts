import type { MergeCache } from '../cache/mergeCache.ts'
import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts'
import type { NormalizedPaths, Slice } from '../types/core.types.ts'
import type { CachedMergeData } from '../types/exclusion.types.ts'
import { isChildOf } from '../utils/comparePaths.ts'
import { createCleanupValidator } from './preCleanupValidation.ts'
import * as vscode from 'vscode'



export function cleanupChildExcludes(
  slice: Slice,
  mergeCache: MergeCache,
  excluder: ExclusionHandler,
  input: string[]
): NormalizedPaths | undefined {

  void vscode.window.showInformationMessage(
    `cleanup called`
  )

  const validator = createCleanupValidator(slice, mergeCache, excluder)

  const { prev, inputSlice } = validator.validateCacheData()

  const newNorm = resolveRecursiveExclude(prev, input)

  const isValid = validator.isValidOutput(prev, { ...newNorm, mergeId: slice.id }, inputSlice)

  if (!isValid) return
  return newNorm
}


function resolveRecursiveExclude(data: CachedMergeData, input: string[]) {

  const { sliceData, details } = data
  const { completeExclude, baseTruth } = details

  const includeFiles = new Set<string>(sliceData.includeFiles)
  const includeFolders = new Set<string>(sliceData.includeFolders)
  const excludeFiles = new Set(sliceData.excludeFiles)
  const excludeFolders = new Set(sliceData.excludeFolders)

  const isDeletable = (path: string): boolean => {
    return completeExclude.get(path) === 'exclude'
      && baseTruth.get(path)?.implicit === 'exclude'
  }

  for (const parent of input) {
    for (const file of excludeFiles) {
      if (!isChildOf(file, parent)) continue
      if (isDeletable(file)) excludeFiles.delete(file)
    }

    for (const folder of excludeFolders) {
      if (!isChildOf(folder, parent)) continue
      if (isDeletable(folder)) excludeFolders.delete(folder)
    }
  }

  return {
    includeFiles: [...includeFiles],
    includeFolders: [...includeFolders],
    excludeFiles: [...excludeFiles],
    excludeFolders: [...excludeFolders],
  }
}