import type { ResolvedTargetMap, SliceMap } from '../types/dataStructure.types.ts'


export function resolveSliceMap({
  map,
  resolvedPath
}: ResolvedTargetMap): SliceMap {
  const includeFiles = new Set(map.includeFiles)
  const includeFolders = new Set(map.includeFolders)
  const excludeFiles = new Set(map.excludeFiles)
  const excludeFolders = new Set(map.excludeFolders)

  const { value, type } = resolvedPath

  switch (type) {
    case "includeFiles": {
      excludeFiles.delete(value)

      if (!hasBasePath(includeFolders, value)) {
        includeFiles.add(value)
      }

      break
    }

    case "includeFolders": {
      excludeFolders.delete(value)

      for (const path of includeFiles) {
        if (isBasePath(value, path)) {
          includeFiles.delete(path)
        }
      }

      for (const path of includeFolders) {
        if (isBasePath(value, path)) {
          includeFolders.delete(path)
        }
      }

      for (const path of excludeFiles) {
        if (isBasePath(value, path)) {
          excludeFiles.delete(path)
        }
      }

      for (const path of excludeFolders) {
        if (isBasePath(value, path)) {
          excludeFolders.delete(path)
        }
      }

      if (!hasBasePath(includeFolders, value)) {
        includeFolders.add(value)
      }

      break
    }

    case "excludeFiles": {
      includeFiles.delete(value)

      if (!hasBasePath(excludeFolders, value)) {
        excludeFiles.add(value)
      }

      break
    }

    case "excludeFolders": {
      includeFolders.delete(value)

      for (const path of excludeFiles) {
        if (isBasePath(value, path)) {
          excludeFiles.delete(path)
        }
      }

      for (const path of excludeFolders) {
        if (isBasePath(value, path)) {
          excludeFolders.delete(path)
        }
      }

      for (const path of includeFiles) {
        if (isBasePath(value, path)) {
          includeFiles.delete(path)
        }
      }

      for (const path of includeFolders) {
        if (isBasePath(value, path)) {
          includeFolders.delete(path)
        }
      }

      if (!hasBasePath(excludeFolders, value)) {
        excludeFolders.add(value)
      }

      break
    }
  }

  return {
    id: map.id,
    name: map.name,
    includeFiles: [...includeFiles],
    includeFolders: [...includeFolders],
    excludeFiles: [...excludeFiles],
    excludeFolders: [...excludeFolders]
  }
}

function isBasePath(basePath: string, path: string): boolean {
  return path.startsWith(`${basePath}/`)
}

function hasBasePath(
  paths: Set<string>,
  path: string
): boolean {
  for (const basePath of paths) {
    if (isBasePath(basePath, path)) {
      return true
    }
  }

  return false
}