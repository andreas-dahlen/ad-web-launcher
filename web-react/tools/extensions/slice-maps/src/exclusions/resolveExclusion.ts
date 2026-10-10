import type { MergedSlice, NodeState, TreeNode } from '../types/dataStructure.types.ts';
import * as vscode from 'vscode'
import { compress } from './compress.ts';
import { createDebug } from '../utils/debug.ts';
type InharitedTruth = {
  implicit: NodeState
  explicit: NodeState | null
}

export function resolveExclusion(
  slice: MergedSlice,
  fileTree: TreeNode[],
  output: vscode.OutputChannel
): Record<string, true> {
  const debug = createDebug(output, "resolution")

  const baseTruth = resolveBaseTruth(slice, fileTree)
  debug('baseTruth:', baseTruth)
  const resolution = effectiveResult(baseTruth, fileTree)
  debug('resolution:', resolution)
  return compress(resolution, output)
}

function resolveBaseTruth( //rename to resolve parent structure or something?
  slice: MergedSlice,
  fileTree: TreeNode[]
): Map<string, InharitedTruth> {
  const baseTruth = new Map<string, InharitedTruth>()

  function topToBottomLoop(
    nodes: TreeNode[],
    implicit: NodeState) {

    for (const node of nodes) {
      const explicitInclude = slice.includeFiles.includes(node.path)
        || slice.includeFolders.includes(node.path)

      const explicitExclude = slice.excludeFiles.includes(node.path)
        || slice.excludeFolders.includes(node.path)

      const explicit = explicitInclude
        ? 'include'
        : (explicitExclude ? 'exclude' : null)

      baseTruth.set(node.path, { implicit, explicit })

      const implicitToChild = explicit ?? implicit

      if (node.children) {
        topToBottomLoop(node.children, implicitToChild)
      }
    }
  }
  topToBottomLoop(fileTree, 'include')
  return baseTruth
}


function effectiveResult(
  baseTruth: Map<string, InharitedTruth>,
  fileTree: TreeNode[]
): Map<string, NodeState> {
  const resolution = new Map<string, NodeState>()
  walkReverseOrder(fileTree, ({ path, children }) => {
    const { implicit, explicit } = baseTruth.get(path)!
    if (explicit === 'include') {
      resolution.set(path, 'include')
      return
    }
    if (implicit === 'include' && explicit !== 'exclude') {
      resolution.set(path, 'include')
      return
    }
    const hasIncludedChild =
      children?.some(child => resolution.get(child.path) === 'include') ?? false

    if (hasIncludedChild) {
      resolution.set(path, 'include')
      return
    }
    resolution.set(path, 'exclude')
  })
  return resolution
}

function walkReverseOrder(
  nodes: TreeNode[],
  visit: (node: TreeNode) => void
): void {
  for (const node of nodes) {
    if (node.children) {
      walkReverseOrder(node.children, visit)
    }
    visit(node)
  }
}