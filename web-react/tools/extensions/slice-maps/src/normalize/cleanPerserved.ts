import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts';
import { compareArrays } from '../exclusions/isContentEqual.ts';
import type { ExcludeOrInclude, Slice } from '../types/core.types.ts';
import * as vscode from 'vscode'


export function cleanPerserved(
  slice: Slice,
  excluder: ExclusionHandler,
  output: vscode.OutputChannel
): Slice | undefined {

  const prev = excluder.getResolutionByMergeId(slice.id)

  if (!prev) return

  const includeFiles = new Set<string>(prev.includeFiles)
  const includeFolders = new Set<string>(prev.includeFolders)
  const excludeFiles = new Set(prev.excludeFiles)
  const excludeFolders = new Set(prev.excludeFolders)


  const { result: { resolution, baseTruth } } = prev

  const isDeletable = (file: string, expected: ExcludeOrInclude): boolean => {
    return resolution.get(file) === expected
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
    compareArrays(newSlice.includeFiles, prev.includeFiles) &&
    compareArrays(newSlice.includeFolders, prev.includeFolders) &&
    compareArrays(newSlice.excludeFiles, prev.excludeFiles) &&
    compareArrays(newSlice.excludeFolders, prev.excludeFolders)
  ) return

  const prevResult = Object.keys(prev.resolvedExclude)

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