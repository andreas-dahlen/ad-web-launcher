import type { ExcludeOrInclude } from '../types/core.types.ts'
import path from 'node:path'


export function compress(
  resolutionData: Map<string, ExcludeOrInclude>,
): Record<string, true> {
  const excludedPaths = new Set<string>()

  for (const [path, type] of resolutionData) {
    if (type === 'exclude') {
      excludedPaths.add(path)
    }
  }

  const exclude: Record<string, true> = {}

  for (const currentPath of excludedPaths) {
    let parentPath = path.dirname(currentPath)
    let hasExcludedAncestor = false

    while (parentPath !== currentPath) {
      if (excludedPaths.has(parentPath)) {
        hasExcludedAncestor = true
        break
      }
      const nextParent = path.dirname(parentPath)
      if (nextParent === parentPath) break
      parentPath = nextParent
    }

    if (!hasExcludedAncestor) {
      exclude[currentPath] = true
    }
  }
  return exclude
}


// function filter(
//   data: Map<string, ExcludeOrInclude>,
// ): Set<string> {
//   const exclude = new Set<string>()

//   for (const [path, type] of data) {
//     if (type === 'include') {
//       continue
//     }
//     exclude.add(path)
//   }
//   return exclude
// }

// function reduse(filtered: Set<string>): Record<string, true> {

//   const exclude: Record<string, true> = {}

//   for (const path of filtered) {
//     if (hasBasePath(filtered, path)) {
//       continue
//     }
//     exclude[path] = true
//   }

//   return exclude
// }