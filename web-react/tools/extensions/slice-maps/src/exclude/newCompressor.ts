import type { ProcessedNode, TreeNode } from '../types/dataStructure.types.ts'

export function compress(
  nodes: TreeNode[],
  processed: Map<string, ProcessedNode>
): Record<string, true> {
  const exclude: Record<string, true> = {}

  function visit(node: TreeNode) {
    const result = processed.get(node.path)
    if (!result) return //shouldn't happen

    if (result.hasExcluded && !result.hasIncluded) {
      exclude[node.path] = true
      return
    }
    if (result.hasIncluded && !result.hasExcluded) return

    const children = node.children
    if (!children) return

    for (const child of children) {
      visit(child)
    }
  }

  for (const node of nodes) {
    visit(node)
  }

  return exclude
}