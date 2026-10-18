import type { PathChoice, SliceFilter, SliceMap } from '../types/core.types.ts'
import type { OverrideBehavior } from '../types/vscode.types.ts'
import { resolveNormalization } from './resolve.ts'
export function normalizeMap(
  map: SliceMap,
  input: PathChoice,
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
  }, input, behavior)

  return { ...rest, ...resolved }
}
export function normalizeFilter(
  filter: SliceFilter,
  paths: PathChoice,
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
  }, paths, behavior)

  return { ...rest, ...resolved }
}

export function normalizeFilterRemoval(
  filter: SliceFilter,
  input: PathChoice
): SliceFilter {
  const excludeFiles = new Set(input.files)
  const excludeFolders = new Set(input.folders)

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