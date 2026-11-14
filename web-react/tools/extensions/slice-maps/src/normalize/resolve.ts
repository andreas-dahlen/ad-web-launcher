import type { NormalizedPaths, NormalizedSets, FilesAndFolders, Action } from '../types/core.types.ts'
import { isChildOf } from '../utils/comparePaths.ts'
import { getBehavior } from '../loaders/loadSettings.ts'
export function resolveNormalization(
  input: FilesAndFolders,
  current: NormalizedSets,
  { category, operation }: Action
): NormalizedPaths {

  if (operation === 'remove') {
    for (const path of input.files) {
      current.includeFiles.delete(path)
      current.excludeFiles.delete(path)
    }
    for (const path of input.folders) {
      current.includeFolders.delete(path)
      current.excludeFolders.delete(path)
    }
  } else if (category === 'include' && operation === 'add') {
    for (const path of input.files) {
      current.includeFiles.add(path)
      current.excludeFiles.delete(path)
    }
    for (const path of input.folders) {
      current.includeFolders.add(path)
      current.excludeFolders.delete(path)
    }
  } else if (category === 'exclude' && operation === 'add') {
    for (const path of input.files) {
      current.includeFiles.delete(path)
      current.excludeFiles.add(path)
    }

    for (const path of input.folders) {
      current.includeFolders.delete(path)
      current.excludeFolders.add(path)
    }
  }

  if (getBehavior() === 'preserve') {
    return {
      includeFiles: [...current.includeFiles],
      includeFolders: [...current.includeFolders],
      excludeFiles: [...current.excludeFiles],
      excludeFolders: [...current.excludeFolders]
    }
  }

  if (category === 'include' && operation === 'add') {
    resolveInclude()
  }

  function resolveInclude() {
    for (const parent of input.folders) {
      for (const file of current.includeFiles) {
        if (isChildOf(file, parent)) { current.includeFiles.delete(file) }
      }
      for (const file of current.excludeFiles) {
        if (isChildOf(file, parent)) { current.excludeFiles.delete(file) }
      }
      for (const folder of current.includeFolders) {
        if (isChildOf(folder, parent)) { current.includeFolders.delete(folder) }
      }
      for (const folder of current.excludeFolders) {
        if (isChildOf(folder, parent)) { current.excludeFolders.delete(folder) }
      }
    }
  }

  return {
    includeFiles: [...current.includeFiles],
    includeFolders: [...current.includeFolders],
    excludeFiles: [...current.excludeFiles],
    excludeFolders: [...current.excludeFolders]
  }
}
