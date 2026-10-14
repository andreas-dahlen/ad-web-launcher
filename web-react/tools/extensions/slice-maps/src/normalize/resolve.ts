import type { NormalizedPaths } from '../types/core.types.ts'
import type { OverrideBehavior } from '../types/vscode.types.ts'
import { hasBasePath, isBasePath } from '../utils/comparePaths.ts'

export function resolveNormalization(
  base: NormalizedPaths,
  mergePaths: NormalizedPaths[],
  behavior: OverrideBehavior
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

      if (behavior === 'preserve') continue

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

      if (behavior === 'preserve') {
        excludeFiles.add(existingPath)
        continue
      }

      if (!hasBasePath(excludeFolders, existingPath)) {
        excludeFiles.add(existingPath)
      }
    }

    for (const path of additions.excludeFolders) {
      includeFolders.delete(path)

      if (behavior === 'preserve') {
        excludeFolders.add(path)
        continue
      }

      // Intentional asymmetry: excludeFolders should never delete includeFiles.

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