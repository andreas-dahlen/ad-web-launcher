import type { SliceMap, TreeNode } from '../types/dataStructure.types.ts'

export function createResolution(
  map: SliceMap,
  fileTree: TreeNode[]
): Map<string, boolean> {
  const resolvedExclude = new Map<string, boolean>()

  if (map.files.length === 0 && map.folders.length === 0) {
    return resolvedExclude
  }

  function shouldIncludeNode(
    node: TreeNode,
    isInsideIncludedFolder: boolean,
  ): boolean {
    const isIncludedFolder =
      node.type === 'folders' &&
      map.folders.includes(node.path)

    const isIncludedFile =
      node.type === 'files' &&
      map.files.includes(node.path)

    if (isInsideIncludedFolder || isIncludedFolder || isIncludedFile) {
      resolvedExclude.set(node.path, false)
      return true
    }

    if (node.type === 'files') {
      resolvedExclude.set(node.path, true)
      return false
    }

    const hasIncludedChild = node.children?.some(child =>
      shouldIncludeNode(child, false)) ?? false

    resolvedExclude.set(node.path, !hasIncludedChild)

    return hasIncludedChild
  }

  for (const node of fileTree) {
    shouldIncludeNode(node, false)
  }

  return resolvedExclude
}