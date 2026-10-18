import type { MergeCache } from '../cache/mergeCache.ts';
import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts';
import { compareArrays } from '../exclusions/isContentEqual.ts';
import type { ExcludeOrInclude, Slice } from '../types/core.types.ts';
import * as vscode from 'vscode'


export function cleanPerserved(
  slice: Slice,
  mergeCache: MergeCache,
  excluder: ExclusionHandler,
  output: vscode.OutputChannel
): Slice | undefined {

  const prev = mergeCache.getCachedMergeData(slice.id)

  if (!prev) return
  const { sliceData, details, resolvedExclude } = prev
  const { completeExclude, baseTruth } = details

  const includeFiles = new Set<string>(sliceData.includeFiles)
  const includeFolders = new Set<string>(sliceData.includeFolders)
  const excludeFiles = new Set(sliceData.excludeFiles)
  const excludeFolders = new Set(sliceData.excludeFolders)

  const isDeletable = (file: string, expected: ExcludeOrInclude): boolean => {
    return completeExclude.get(file) === expected
      && baseTruth.get(file)?.implicit === expected
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

  const newSlice = {
    mergeId: slice.id,
    includeFiles: [...includeFiles],
    includeFolders: [...includeFolders],
    excludeFiles: [...excludeFiles],
    excludeFolders: [...excludeFolders],
  }

  if (
    compareArrays(newSlice.includeFiles, sliceData.includeFiles) &&
    compareArrays(newSlice.includeFolders, sliceData.includeFolders) &&
    compareArrays(newSlice.excludeFiles, sliceData.excludeFiles) &&
    compareArrays(newSlice.excludeFolders, sliceData.excludeFolders)
  ) return

  const prevResult = Object.keys(resolvedExclude)

  const newExclude = excluder.resolve(newSlice, output)
  const newResult = Object.keys(newExclude)

  if (!compareArrays(prevResult, newResult)) {
    return
  }

  if (slice.type === 'map') {
    return {
      ...slice,
      includeFiles: [...includeFiles],
      includeFolders: [...includeFolders],
      excludeFiles: [...excludeFiles],
      excludeFolders: [...excludeFolders],
    }
  }

  return {
    ...slice,
    excludeFiles: [...excludeFiles],
    excludeFolders: [...excludeFolders]
  }
}