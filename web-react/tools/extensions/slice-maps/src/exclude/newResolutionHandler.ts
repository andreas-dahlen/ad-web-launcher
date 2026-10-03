import type { ProcessedNode, SliceMap, TreeNode } from '../types/dataStructure.types.ts';
import * as vscode from 'vscode'
import { compress } from './newCompressor.ts';

export function newResolution(
  map: SliceMap,
  fileTree: TreeNode[],
  output: vscode.OutputChannel
): Record<string, true> {

  function walkPostOrder(
    nodes: TreeNode[],
    visit: (node: TreeNode) => void
  ) {
    for (const node of nodes) {
      if (node.children) {
        walkPostOrder(node.children, visit)
      }

      visit(node)
    }
  }

  const processed = new Map<string, ProcessedNode>()

  walkPostOrder(fileTree, ({ path, type, children }) => {
    const isIncludedFolder = type === 'folders' && map.includeFolders.includes(path)
    const isIncludedFile = type === 'files' && map.includeFiles.includes(path)
    const isExcludedFolder = type === 'folders' && map.excludeFolders.includes(path)
    const isExcludedFile = type === 'files' && map.excludeFiles.includes(path)

    output.appendLine(
      `[DEBUG] ${path}: ` +
      `exclude=${isExcludedFolder}, ` +
      `include=${isIncludedFolder}, ` +
      `includedFile=${isIncludedFile} `
    )

    if (isExcludedFile) {
      processed.set(path, { hasExcluded: true, hasIncluded: false })
      return
    }
    if (isIncludedFile) {
      processed.set(path, { hasExcluded: false, hasIncluded: true })
      return
    }

    const childResults = children?.map(child =>
      processed.get(child.path)
    ) ?? []

    processed.set(path, {
      hasExcluded:
        isExcludedFolder ||
        childResults.some(child => child?.hasExcluded),

      hasIncluded:
        isIncludedFolder ||
        childResults.some(child => child?.hasIncluded)
    })
  })

  return compress(fileTree, processed)
}