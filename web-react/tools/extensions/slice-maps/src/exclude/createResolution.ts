import type { SliceMap, TreeNode } from '../types/dataStructure.types.ts'
import * as vscode from 'vscode'
export function createResolution(
  map: SliceMap,
  fileTree: TreeNode[],
  output: vscode.OutputChannel
): Record<string, true> {

  const accumulated = accumulateExclusions(map, fileTree, output)

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
  fileTree: TreeNode[],
  output: vscode.OutputChannel
): string[] {

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

    output.appendLine(
      `[DEBUGOLD] ${node.path}: ` +
      `exclude=${isExcludeFolder}, ` +
      `include=${isIncludedFolder}, ` +
      `includedFile=${isIncludedFile}, ` +
      `insideIncluded=${isInsideIncludedFolder}`
    )

    if (isExcludeFile) {
      exclude.add(node.path)
      return false
    }

    if (isExcludeFolder) {
      const hasIncludedChild =
        node.children?.some(child =>
          shouldIncludeNode(child, false)
        ) ?? false

      if (!hasIncludedChild) {
        exclude.add(node.path)
      }

      return hasIncludedChild
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