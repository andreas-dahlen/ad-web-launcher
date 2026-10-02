import type { SliceMap, TreeNode } from '../types/dataStructure.types.ts'

export function createResolution(
  map: SliceMap,
  fileTree: TreeNode[]
): Record<string, true> {


  const accumulated = accumulateExclusions(map, fileTree)

  const exclude: Record<string, true> = {}

  let currentTarget: string | undefined

  for (const path of accumulated.toReversed()) {
    if (path.startsWith(`${currentTarget}/`)) {
      continue
    }

    exclude[path] = true
    currentTarget = path
  }

  return exclude
}

function accumulateExclusions(
  map: SliceMap,
  fileTree: TreeNode[]
): string[] {

  if (
    map.includeFiles.length === 0 &&
    map.includeFolders.length === 0 &&
    map.excludeFiles.length === 0 &&
    map.excludeFolders.length === 0
  ) {
    return []
  }

  const exclude = new Set<string>()


  function shouldIncludeNode(
    node: TreeNode,
    isInsideIncludedFolder: boolean
  ): boolean {
    const isIncludedFolder =
      node.type === 'folders' &&
      map.includeFolders.includes(node.path)

    const isIncludedFile =
      node.type === 'files' &&
      map.includeFiles.includes(node.path)

    const isExcludeFolder =
      node.type === 'folders' &&
      map.excludeFolders.includes(node.path)

    const isExcludeFile =
      node.type === 'files' &&
      map.excludeFiles.includes(node.path)

    if (isExcludeFolder || isExcludeFile) {
      exclude.add(node.path)
      return false
    }

    if (isInsideIncludedFolder || isIncludedFolder || isIncludedFile) {
      return true
    }

    if (node.type === 'files') {
      exclude.add(node.path)
      return false
    }

    const hasIncludedChild =
      node.children?.some(child =>
        shouldIncludeNode(
          child,
          isInsideIncludedFolder || isIncludedFolder
        )
      ) ?? false

    if (!hasIncludedChild) {
      exclude.add(node.path)
    }

    return hasIncludedChild
  }

  for (const node of fileTree) {
    shouldIncludeNode(node, false)
  }

  return [...exclude]
}