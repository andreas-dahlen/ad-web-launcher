import type { NormalizedPaths, SliceFilter, SliceMap } from '../types/core.types.ts'
import type { OverrideBehavior } from '../types/vscode.types.ts'
import { resolveNormalization } from './resolve.ts'

export function normalizeMap(
  map: SliceMap,
  resolvedPaths: NormalizedPaths,
  behavior: OverrideBehavior
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
  }, [resolvedPaths], behavior)

  return { ...rest, ...resolved }
}
export function normalizeFilter(
  filter: SliceFilter,
  resolvedPaths: NormalizedPaths,
  behavior: OverrideBehavior
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
  }, [resolvedPaths], behavior)

  return { ...rest, ...resolved }
}

export function normalizeFilterRemoval(
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