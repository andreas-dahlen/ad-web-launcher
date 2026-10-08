import type { NormalizedPaths, SliceFilter, SliceMap } from '../types/dataStructure.types.ts'
import { resolveNormalization } from './normalization.ts'

export function resolveMap(
  map: SliceMap,
  resolvedPaths: NormalizedPaths
): SliceMap {

  const { includeFiles,
    includeFolders,
    excludeFiles,
    excludeFolders, ...rest } = map

  const resolved = resolveNormalization({
    includeFiles,
    includeFolders,
    excludeFiles,
    excludeFolders
  }, [resolvedPaths])

  return { ...rest, ...resolved }
}
export function resolveFilter(
  filter: SliceFilter,
  resolvedPaths: NormalizedPaths
): SliceFilter {

  const {
    excludeFiles,
    excludeFolders, ...rest } = filter

  const includeFiles: string[] = []
  const includeFolders: string[] = []

  const resolved = resolveNormalization({
    includeFiles,
    includeFolders,
    excludeFiles,
    excludeFolders
  }, [resolvedPaths])

  return { ...rest, ...resolved }
}

export function resolveFilterRemoval(
  filter: SliceFilter,
  resolvedPaths: NormalizedPaths
): SliceFilter {
  const excludeFiles = new Set(resolvedPaths.excludeFiles)
  const excludeFolders = new Set(resolvedPaths.excludeFolders)

  return {
    ...filter,
    excludeFiles: filter.excludeFiles.filter(
      path => !excludeFiles.has(path)
    ),
    excludeFolders: filter.excludeFolders.filter(
      path => !excludeFolders.has(path)
    )
  }
}