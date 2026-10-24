import type { PathChoice, NormalizedPaths } from '../types/core.types.ts'
import { isChildOf, isInheriting } from '../utils/comparePaths.ts'
import { getBehavior } from '../loaders/loadSettings.ts'
export function resolveNormalization(
  base: NormalizedPaths,
  input: PathChoice
): NormalizedPaths {
  const includeFiles = new Set<string>(base.includeFiles)
  const includeFolders = new Set<string>(base.includeFolders)
  const excludeFiles = new Set(base.excludeFiles)
  const excludeFolders = new Set(base.excludeFolders)

  if (input.action === 'include') {
    for (const path of input.files) {
      includeFiles.add(path)
      excludeFiles.delete(path)
    }
    for (const path of input.folders) {
      includeFolders.add(path)
      excludeFolders.delete(path)
    }
  } else {
    for (const path of input.files) {
      includeFiles.delete(path)
      excludeFiles.add(path)
    }

    for (const path of input.folders) {
      includeFolders.delete(path)
      excludeFolders.add(path)
    }
  }

  if (getBehavior() === 'preserve') return {
    includeFiles: [...includeFiles],
    includeFolders: [...includeFolders],
    excludeFiles: [...excludeFiles],
    excludeFolders: [...excludeFolders]
  }

  if (input.action === 'include') {
    resolveInclude()
  } else {
    resolveExclude()
  }

  function resolveInclude() {
    for (const parent of input.folders) {
      for (const file of includeFiles) {
        if (isChildOf(file, parent)) { includeFiles.delete(file) }
      }
      for (const file of excludeFiles) {
        if (isChildOf(file, parent)) { excludeFiles.delete(file) }
      }
      for (const folder of includeFolders) {
        if (isChildOf(folder, parent)) { includeFolders.delete(folder) }
      }
      for (const folder of excludeFolders) {
        if (isChildOf(folder, parent)) { excludeFolders.delete(folder) }
      }
    }
  }

  function resolveExclude() {
    const folders = { includeFolders, excludeFolders }
    for (const parent of input.folders) {

      for (const file of excludeFiles) {
        if (isChildOf(file, parent) &&
          isInheriting(file, 'exclude', folders)) {
          excludeFiles.delete(file)
        }
      }

      for (const folder of excludeFolders) {
        if (isChildOf(folder, parent) &&
          isInheriting(folder, 'exclude', folders)) {
          excludeFolders.delete(folder)
        }
      }
    }
  }

  return {
    includeFiles: [...includeFiles],
    includeFolders: [...includeFolders],
    excludeFiles: [...excludeFiles],
    excludeFolders: [...excludeFolders]
  }
}
