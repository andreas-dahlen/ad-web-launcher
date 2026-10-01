import type { SliceMap, TreeNode } from '../types/dataStructure.types.ts'

export function createResolution(
  map: SliceMap,
  fileTree: TreeNode[]
): Map<string, boolean> {


  const resolution = initialResolution(map, fileTree)

  const exclude = new Map<string, boolean>()

  let currentTarget: string | undefined

  for (const path of resolution.exclude.toReversed()) {
    if (path.startsWith(`${currentTarget}/`)) {
      continue
    }

    exclude.set(path, true)
    currentTarget = path
  }

  return exclude
}

type Resolution = {
  include: string[]
  exclude: string[]
}

function initialResolution(
  map: SliceMap,
  fileTree: TreeNode[]
): Resolution {

  if (map.files.length === 0 && map.folders.length === 0) {
    return { include: [], exclude: [] }
  }

  const include = new Set<string>()
  const exclude = new Set<string>()


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
      include.add(node.path)
      return true
    }

    if (node.type === 'files') {
      exclude.add(node.path)
      return false
    }

    const hasIncludedChild =
      node.children?.some(child =>
        shouldIncludeNode(child, false)
      ) ?? false

    if (hasIncludedChild) {
      include.add(node.path)
    } else {
      exclude.add(node.path)
    }

    return hasIncludedChild
  }

  for (const node of fileTree) {
    shouldIncludeNode(node, false)
  }

  return {
    include: [...include],
    exclude: [...exclude]
  }
}