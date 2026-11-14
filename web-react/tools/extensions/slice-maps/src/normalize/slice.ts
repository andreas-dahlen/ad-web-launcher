import type { Action, ExcludeOrInclude, FilesAndFolders, SliceFilter, SliceMap } from '../types/core.types.ts'
import { resolvePathChoice } from './pathChoice.ts'
import { resolveNormalization } from './resolve.ts'

export function normalizeMap(
  map: SliceMap,
  input: FilesAndFolders,
  category: ExcludeOrInclude
): { map: SliceMap; action: Action } {

  const current = {
    includeFiles: new Set<string>(map.includeFiles),
    includeFolders: new Set<string>(map.includeFolders),
    excludeFiles: new Set(map.excludeFiles),
    excludeFolders: new Set(map.excludeFolders)
  }

  const { type, id, name } = map

  const action: Action = resolvePathChoice(input, category, current)
  const resolved = resolveNormalization(input, current, action)

  return {
    map: { type, id, name, ...resolved },
    action
  }
}
export function normalizeFilter(
  filter: SliceFilter,
  input: FilesAndFolders,
  category: ExcludeOrInclude
): { filter: SliceFilter; action: Action } {

  const current = {
    includeFiles: new Set<string>(),
    includeFolders: new Set<string>(),
    excludeFiles: new Set(filter.excludeFiles),
    excludeFolders: new Set(filter.excludeFolders)
  }

  const { type, id, name } = filter

  const action: Action = resolvePathChoice(input, category, current)
  const resolved = resolveNormalization(input, current, action)

  return {
    filter: { type, id, name, ...resolved },
    action
  }
}