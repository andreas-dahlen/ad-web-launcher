import type { SliceMap, TreeNode } from '../types/dataStructure.types.ts';
import * as vscode from 'vscode'
import { compress } from './compress.ts';
import { createDebug } from '../utils/debug.ts';

export function resolveExclusion(
  map: SliceMap,
  fileTree: TreeNode[],
  output: vscode.OutputChannel
): Record<string, true> {

  const debug = createDebug(output, "resolution")

  type NodeTruth = {
    implicit: 'include' | 'exclude'
    explicit: 'include' | 'exclude' | null
  }
  const topDownResult = new Map<string, NodeTruth>()

  function topToBottom(nodes: TreeNode[], implicit: 'include' | 'exclude') {

    for (const node of nodes) {
      const explicitInclude = map.includeFiles.includes(node.path) || map.includeFolders.includes(node.path)

      const explicitExclude = map.excludeFiles.includes(node.path) ||
        map.excludeFolders.includes(node.path)

      const explicit = explicitInclude
        ? 'include'
        : (explicitExclude ? 'exclude' : null)

      topDownResult.set(node.path, { implicit, explicit })

      const implicitToChild = explicit ?? implicit
      if (node.children) {
        topToBottom(node.children, implicitToChild)
      }
    }
  }



  function walkReverseOrder(
    nodes: TreeNode[],
    visit: (node: TreeNode) => void
  ) {
    for (const node of nodes) {
      if (node.children) {
        walkReverseOrder(node.children, visit)
      }

      visit(node)
    }
  }
  topToBottom(fileTree, 'include')

  debug("topDown", topDownResult)

  const resolution = new Map<string, boolean>()
  // false = include
  // true  = exclude

  walkReverseOrder(fileTree, ({ path, children }) => {
    const { implicit, explicit } = topDownResult.get(path)!
    if (explicit === 'include') {
      resolution.set(path, false)
      return
    }
    if (implicit === 'include' && (explicit !== 'exclude')) {
      resolution.set(path, false)
      return
    }
    const hasIncludedChild =
      children?.some(child => resolution.get(child.path) === false) ?? false

    if (hasIncludedChild) {
      resolution.set(path, false)
      return
    }
    resolution.set(path, true)
  })

  debug("resolution:", resolution)

  return compress(resolution, output)
}