import type { Action, ExcludeOrInclude, FilesAndFolders, NormalizedSets } from '../types/core.types.ts'

export function resolvePathChoice(
  input: FilesAndFolders,
  category: ExcludeOrInclude,
  current: NormalizedSets): Action {

  const total = input.folders.size + input.files.size

  const [files, folders] = category === 'include'
    ? [current.includeFiles, current.includeFolders]
    : [current.excludeFiles, current.excludeFolders]

  let amount = 0

  for (const folder of input.folders) {
    if (folders.has(folder)) amount++
  }

  for (const file of input.files) {
    if (files.has(file)) amount++
  }

  if (total === 0) {
    throw new Error('Cannot resolve an empty path selection.')
  }

  const operation = amount * 2 > total ? 'remove' : 'add'

  return {
    operation,
    category
  }
}