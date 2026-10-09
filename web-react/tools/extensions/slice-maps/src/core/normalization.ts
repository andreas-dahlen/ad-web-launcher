import type { NormalizedPaths } from '../types/dataStructure.types.ts'
import { hasBasePath, isBasePath } from '../utils/comparePaths.ts'

export function resolveNormalization(
  base: NormalizedPaths,
  mergePaths: NormalizedPaths[]
): NormalizedPaths {
  const includeFiles = new Set<string>(base.includeFiles)
  const includeFolders = new Set<string>(base.includeFolders)
  const excludeFiles = new Set(base.excludeFiles)
  const excludeFolders = new Set(base.excludeFolders)

  for (const additions of mergePaths) {
    for (const path of additions.includeFiles) {
      includeFiles.add(path)
      excludeFiles.delete(path)
    }
    for (const path of additions.includeFolders) {
      includeFolders.add(path)
      excludeFolders.delete(path)

      for (const existingPath of includeFiles) {
        if (isBasePath(path, existingPath)) {
          includeFiles.delete(existingPath)
        }
      }

      for (const existingPath of includeFolders) {
        if (isBasePath(path, existingPath)) {
          includeFolders.delete(existingPath)
        }
      }

      for (const existingPath of excludeFiles) {
        if (isBasePath(path, existingPath)) {
          excludeFiles.delete(existingPath)
        }
      }

      for (const existingPath of excludeFolders) {
        if (isBasePath(path, existingPath)) {
          excludeFolders.delete(existingPath)
        }
      }
    }
    for (const existingPath of additions.excludeFiles) {
      includeFiles.delete(existingPath)

      if (!hasBasePath(excludeFolders, existingPath)) {
        excludeFiles.add(existingPath)
      }
    }
    for (const path of additions.excludeFolders) {
      includeFolders.delete(path)

      for (const existingPath of excludeFiles) {
        if (isBasePath(path, existingPath)) {
          excludeFiles.delete(existingPath)
        }
      }

      for (const existingPath of excludeFolders) {
        if (isBasePath(path, existingPath)) {
          excludeFolders.delete(existingPath)
        }
      }

      // for (const path of includeFiles) {
      //   if (isBasePath(path, path)) {
      //     includeFiles.delete(path)
      //   }
      // }

      for (const existingPath of includeFolders) {
        if (isBasePath(path, existingPath)) {
          includeFolders.delete(existingPath)
        }
      }

      if (!hasBasePath(excludeFolders, path)) {
        excludeFolders.add(path)
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